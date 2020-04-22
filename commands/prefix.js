const db = require('../db/db')
const conf = db.get('conf')
const {resolveMemberFromID} = require('../common')

module.exports = {
    name: 'prefix',
	description: 'Change the command prefix',
	usage: '<new prefix>',
    cooldown: 36000,
    args:true,
    async execute(msg, args){
        const member = await resolveMemberFromID(msg.author.id, msg.guild)
        if(!member.hasPermission("MANAGE_SERVER")) return msg.reply(embedify("Sorry, but you don't have permission do that."))
        const doc = await conf.findOne({guildID:msg.guild.id})
        const newPrefix = args[0]
        doc.prefix = newPrefix
        doc.save().then(()=>msg.channel.send(`Prefix updated to ${newPrefix}`)).catch(err=>{console.log(err), msg.channel.send("Error updating prefix")})
    }
}