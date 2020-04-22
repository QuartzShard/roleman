const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'List all commands, or info about a specific command.',
	aliases: ['commands','explainYourselfRoleMan'],
	usage: '[command name]',
	cooldown: 5,
	execute(msg, args) {
		const data = [];
		const { commands } = msg.client;

		if (!args.length) {
			data.push('Here\'s a list of all available commands:');
			data.push(
                commands.map(command => {
                    if (!command.forbidden){
                        return  command.name
                    }
                }).filter(el => {return el != null;}).join(', ')
            );
			data.push(`\nUse \`${prefix}help [command name]\` to get info on a specific command.`);

			return msg.channel.send(data, { split: true })
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return msg.reply(`Command not recognised, try \`${prefix}help\`.`);
		}

		data.push(`> **${command.name}:**`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		return msg.channel.send(data, { split: true });
	},
};