const fs = require('fs')
const { embedify } = require('../common') 

module.exports = {
	name: 'reload',
	description: 'Reloads a command, owner only',
    forbidden:true,
	async execute(msg, args) {
        let author = msg.author
        if (author.id != '162573022727897088') return msg.channel.send(embedify("You don't have access to this command",false,{error:true}))
        let commandName = args[0] || null;
        if (commandName == "all" || !commandName) {
            let commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            for (let file of commandFiles) {
            	let command = requireUncached(`../commands/${file}`);
            	msg.client.commands.set(command.name, command);
            }
            msg.channel.send("Reloaded all commands")
        } else {
            let command = msg.client.commands.get(commandName.toLowerCase())
                || msg.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
            if (!command) {
                return msg.channel.send(embedify(`There is no command with name or alias \`${commandName}\`, ${msg.author}!`,false,{error:true}));
            }
    
            delete require.cache[require.resolve(`./${command.name}.js`)];
    
            try {
                let newCommand = require(`./${command.name}.js`);
                msg.client.commands.set(newCommand.name, newCommand);
            } catch (error) {
                console.log(error);
                return msg.channel.send(embedify(`There was an error while reloading a command \`${command.name}\`:\n\`${error.msg}\``,false,{error:true}));
            }
            msg.channel.send(`Command \`${command.name}\` was reloaded!`);
        }
	},
};

function requireUncached(module) {
    if (require.resolve(module)) {
        delete require.cache[require.resolve(module)];
    }
    return require(module);
}