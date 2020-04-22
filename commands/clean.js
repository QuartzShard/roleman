const db = require('../db/db')
const conf = db.get('conf')

module.exports = {
    name: 'clean',
	description: 'Remove messages to/from this bot',
    aliases: ['tidy','nuke','prune'],
    usage:"<extraPrefix> Optional, cleans anything with this prefix, too",
	cooldown: 5,
	async execute(msg, args) {
        const doc = await conf.findOne({guildID:msg.guild.id})
        const prefix = doc.prefix
        var msgs = msg.channel.messages
        if (!args[0]){
            var toDel = await msgs.fetch().then(async messages => {
                return messages.filter(m => 
                    m.author == msg.client.user || m.content.startsWith(prefix)
                )
            }).catch(console.error)
        } else {
            var toDel = await msgs.fetch().then(async messages => {
                return messages.filter(m => 
                    m.author == msg.client.user || m.content.startsWith(prefix) || m.content.startsWith(args[0])
                )
            }).catch(console.error)
        }
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