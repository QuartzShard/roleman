const fs = require('fs')

module.exports = {
	name: 'reload',
	description: 'Reloads a command, owner only',
    forbidden:true,
	execute(msg, args) {
        if (!(msg.author.id == '162573022727897088')) return
        const commandName = args[0].toLowerCase();
        if (commandName == "all" || !commandName) {
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
            	const command = requireUncached(`../commands/${file}`);
            	msg.client.commands.set(command.name, command);
            }
            msg.channel.send("Reloaded all commands")
        } else {
            const command = msg.client.commands.get(commandName)
                || msg.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
            if (!command) {
                return msg.channel.send(`There is no command with name or alias \`${commandName}\`, ${msg.author}!`);
            }
    
            delete require.cache[require.resolve(`./${command.name}.js`)];
    
            try {
                const newCommand = require(`./${command.name}.js`);
                msg.client.commands.set(newCommand.name, newCommand);
            } catch (error) {
                console.log(error);
                return msg.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.msg}\``);
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