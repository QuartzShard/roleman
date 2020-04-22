require('dotenv').config()
const fs = require('fs');
const Discord = require('discord.js');
const db = require('./db/db')
const conf = db.get("conf")
const {defaultPrefix} = require("./config.json")

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('guildCreate', async (guild) => {
    if (! await db.get('conf').findOne({guildID:guild.id})) {
        const doc = new conf({guildID:guild.id,prefix:defaultPrefix})
        doc.save().then(()=>console.log("New server registered! " + guild.name)).catch(err=>console.log(err))
    }
    if (guild.systemChannel){
        guild.systemChannel.send("Thanks for adding this bot! The default prefix is `rm!`, try `rm!help` to get started.")
    } else {
        guild.channels.cache.filter(c=>c.type=="text").array()[0].send("Thanks for adding this bot! The default prefix is `rm!`, try `rm!help` to get started.")
    }
})
client.on("guildDelete", async (guild)=>{
    conf.remove({guildID:guild.id}).then(()=>console.log("Bot removed from " + guild.name)).catch(err=>console.log(err))
})

client.on("guildMemberAdd", async (member)=>{
    const guild = member.guild
    const guildConf = await conf.findOne({guildID:guild.id})
    if (guildConf.joinRoles) {
        for (const role of guildConf.joinRoles) {
            const resolvedRole = await guild.roles.fetch(role)
            member.roles.add(resolvedRole)
        }
    }
})

client.on("message", async (msg) => {
    const doc = await conf.findOne({guildID:msg.guild.id})
    const prefix = doc.prefix
    if (!msg.content.startsWith(prefix) || msg.author.bot || msg.channel.type === "dm") {
        return 
    };
    var args = msg.content.slice(prefix.length).split(/ +/)
    var commandName = args.shift().toLowerCase()
    
    var command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if(!command) {
        return msg.reply(`Command not recognised, try \`${prefix}help\`.`)
    }

    if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${msg.author}!`;
		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return msg.reply(reply);
    }
    
    if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
	const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(msg.author.id)) {
		const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return msg.reply(`\`${command.name}\` is on cooldown for ${timeLeft.toFixed(1)} more second(s)`);
		}
    }
    timestamps.set(msg.author.id, now);
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
    
    try {
		command.execute(msg, args);
	} catch (error) {
		console.error(error);
		msg.reply('Something broke while executing that command.');
	}
})

client.login(process.env.API_TOKEN);

