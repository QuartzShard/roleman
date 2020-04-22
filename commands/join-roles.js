const db = require('../db/db')
const conf = db.get('conf')
const {getRoleIDFromMention} = require('../common')

module.exports = {
    name: 'join-roles',
    aliases:['join-role'],
	description: 'Configure roles for the bot to add to new members',
	usage: '<@role> || [<@role>,..]',
    cooldown: 10,
    args:true,
    async execute(msg, args){
        var roles = []
        var displayRoles = []
        for (const arg of args) {
            const roleData = await getRoleIDFromMention(msg, arg)
            displayRoles.push(roleData[0])
            roles.push(roleData [1])
        }
        if (roles.length == 0) return msg.channel.send("> No valid roles were specified")
        var guildConf = await conf.findOne({guildID:msg.guild.id})
        guildConf.joinRoles = roles
        guildConf.save()
        .then(()=>msg.channel.send(`> Successfully set role(s) to give on joining: ${displayRoles}`))
        .catch(err=>{console.log(err);msg.channel.send("> An error prevented the roles from being added")})
    },
}
