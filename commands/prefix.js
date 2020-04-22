const db = require('../db/db')
const conf = db.get('conf')
const {resolveMemberFromID} = require('../common')

module.exports = {
    name: 'prefix',
	description: 'Change the command prefix',
	usage: '<new prefix>',
    cooldown: 600,
    args:true,
    async execute(msg, args){
        let member = msg.member
        if(!member.hasPermission("MANAGE_GUILD")) return msg.channel.send(embedify("Sorry, but you don't have permission do that.",false,{error:true}))
        let doc = await conf.findOne({guildID:msg.guild.id})
        let newPrefix = args[0]
        doc.prefix = newPrefix
        doc.save()
            .then(()=>msg.channel.send(embedify(`Prefix updated to ${newPrefix}`)))
            .catch(err=>{console.log(err), msg.channel.send(embedify("Error updating prefix",false,{error:true}))})
    }
}