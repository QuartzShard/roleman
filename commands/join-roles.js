const db = require('../db/db')
const conf = db.get('conf')
const {getRoleIDFromMention, resolveRoleFromID, embedify} = require('../common')

module.exports = {
    name: 'join-roles',
    aliases:['join-role','joinrole','joinroles'],
	description: 'Configure roles for the bot to add to new members',
	usage: '<@role> || [<@role>,..]',
    cooldown: 10,
    args:true,
    async execute(msg, args){
        let member = msg.member
        if(!member.hasPermission("MANAGE_ROLES")) return msg.reply(embedify("Sorry, but you don't have permission do that."))
        var roles = []
        var displayRoles = []
        for (let arg of args) {
            let roleData = await getRoleIDFromMention(arg)
            displayRoles.push(roleData[0])
            roles.push(roleData [1])
        }
        if (roles.length == 0) return msg.channel.send("> No valid roles were specified")

        let resolvedRoles = await resolveRoleFromID(roles,msg.guild)
        for (let role of resolvedRoles) {
            if (role.comparePositionTo(member.roles.highest) > 0) return msg.reply(embedify("Sorry, but you don't have permission do that."))
        }
        var guildConf = await conf.findOne({guildID:msg.guild.id})
        guildConf.joinRoles = roles
        guildConf.save()
        .then(()=>msg.channel.send(`> Successfully set role(s) to give on joining: ${displayRoles}`))
        .catch(err=>{console.log(err);msg.channel.send("> An error prevented the roles from being added")})
    },
}
