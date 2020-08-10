const fs = require('fs');
const Discord = require('discord.js');
const db = require(`${__dirname}/db/db`)
const conf = db.get("conf")
const {defaultPrefix, API_TOKEN} = require("./config.json")
const {resolveRoleFromID, resolveMemberFromID, embedify} = require("./common")

//const client = new Discord.Client();
const client = new Discord.Client({ partials:['MESSAGE','REACTION']});

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith('.js'));

for (let file of commandFiles) {
	let command = require(`${__dirname}/commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', async () => {
	console.log('Ready!');
});

client.on('guildCreate', async (guild) => {
    if (! await db.get('conf').findOne({guildID:guild.id})) {
        let doc = new conf({guildID:guild.id,guildName:guild.name,prefix:defaultPrefix})
        doc.save().then(()=>console.log("New server registered! " + guild.name)).catch(err=>console.log(err))
    }
    if (guild.systemChannel){
        guild.systemChannel.channel.send(embedify("Thanks for adding this bot! The default prefix is `rm!`, try `rm!help` to get started."))
    } else {
        guild.channels.cache.filter(c=>c.type=="text").array()[0]
        .channel.send(embedify("Thanks for adding this bot! The default prefix is `rm!`, try `rm!help` to get started."))
    }
})
client.on("guildDelete", async (guild)=>{
    conf.remove({guildID:guild.id}).then(()=>console.log("Bot removed from " + guild.name)).catch(err=>console.log(err))
})

client.on("guildMemberAdd", async (member)=>{
    let guild = member.guild
    let guildConf = await conf.findOne({guildID:guild.id})
    if (guildConf.joinRoles) {
        let roles = await resolveRoleFromID(guildConf.joinRoles,guild) 
        for (let role of roles) {
            member.roles.add(role)
        }
    }
})

client.on("messageReactionAdd", async (reaction,user) => {
    if (user.bot) return
    if (reaction.message.partial) reaction.message = await reaction.message.fetch()
    if (reaction.message.author.id != client.user.id) return
    let guildConf = await conf.findOne({guildID:reaction.message.guild.id})
    if (!guildConf.selfRoles) return
    let member = await resolveMemberFromID(user.id,reaction.message.guild)
    guildConf.selfRoles.map(m => {
        if(m.emoji == reaction.emoji.id || m.emoji == reaction.emoji.name) {
            member.roles.add(m.role)
        }
    } )
})

client.on("messageReactionRemove", async (reaction,user) => {
    if (user.bot) return
    if (reaction.message.partial) reaction.message = await reaction.message.fetch()
    if (reaction.message.author.id != client.user.id) return
    let guildConf = await conf.findOne({guildID:reaction.message.guild.id})
    if (!guildConf.selfRoles) return
    let member = await resolveMemberFromID(user.id,reaction.message.guild)
    guildConf.selfRoles.map(m => {
        if(m.emoji == reaction.emoji.id || m.emoji == reaction.emoji.name) {
            member.roles.remove(m.role)
        }
    } )
})

client.on("message", async (msg) => {
    try     {if (msg.partial) await msg.fetch()}
    catch   {return}
    let doc = await conf.findOne({guildID:msg.guild.id})
    if (!doc) {
        doc = new conf({guildID:msg.guild.id,guildName:msg.guild.name,prefix:defaultPrefix})
        doc.save().then(()=>console.log("New server registered! " + msg.guild.name)).catch(err=>console.log(err))
    }
    let prefix = doc.prefix 

    if (!msg.content.startsWith(prefix) || msg.author.bot || msg.channel.type === "dm") {
        return 
    };

    if (process.env.DEBUG) console.log(msg.author, msg.member)

    var args = msg.content.slice(prefix.length).split(/ +/)
    var commandName = args.shift().toLowerCase()
    
    var command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if(!command) {
        return msg.channel.send(embedify(`Command not recognised, try \`${prefix}help\`.`,false,{error:true}))
    }
    
    if (command.args && !args.length) {
		let reply = [`You didn't provide any arguments, and this command expects some`];
		if (command.usage) {
			reply.push(`The proper usage would be: \`${prefix}${command.name} ${command.usage}\``);
		}
		return msg.channel.send(embedify(reply.shift(),reply,{error:true}));
    }
    
    if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
    }
    let now = Date.now();
	let timestamps = cooldowns.get(command.name);
    let cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(msg.author.id)) {
		let expirationTime = timestamps.get(msg.author.id) + cooldownAmount;
		if (now < expirationTime) {
			let timeLeft = (expirationTime - now) / 1000;
			return msg.channel.send(embedify(`\`${command.name}\` is on cooldown for ${timeLeft.toFixed(1)} more second(s)`,false,{error:true}));
		}
    }
    timestamps.set(msg.author.id, now);
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
    
    try {
		command.execute(msg, args);
	} catch (error) {
		console.error(error);
		msg.channel.send(embedify('Something broke while executing that command.',false,{error:true}));
	}
})
client.login(API_TOKEN);

