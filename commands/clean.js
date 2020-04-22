const { prefix } = require('../config.json');


module.exports = {
    name: 'clean',
	description: 'Remove messages to/from this bot',
	aliases: ['tidy','nuke','prune'],
	usage: `${prefix}clean`,
	cooldown: 5,
	async execute(msg) {
        var msgs = msg.channel.messages
        var toDel = await msgs.fetch().then(async messages => {
            return messages.filter(m => 
                m.author == msg.client.user || m.content.startsWith(prefix)
            )
        }).catch(console.error)
        msg.channel.bulkDelete(toDel,true)
        msg.channel.send("All clean!")
        await sleep(1500)
        var toDel = await msgs.fetch().then(async messages => {
            return messages.filter(m => 
                m.author == msg.client.user || m.content.startsWith(prefix)
            )
        }).catch(console.error)
        msg.channel.bulkDelete(toDel,true)
    }
}
const sleep = function (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}    