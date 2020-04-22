const {getRoleIDFromMention,getUsersFromRole,resolveMemberFromID,embedify} = require('../common')

module.exports= {
    name:"list-role-holders",
    aliases:['list-holders','list-role-users','listholders'],
    description:"List all users belonging to a role",
    args:true,
    usage:"<@role>",
    async execute(msg, args) {
        let member = msg.member
        if(!member.hasPermission("MANAGE_ROLES")) return msg.reply(embedify("Sorry, but you don't have permission do that.",false,{error:true}))
        let roleID= await getRoleIDFromMention(args[0])[1]
        let holders = await getUsersFromRole(roleID,msg.guild)
        msg.channel.send(args[0])
        try {
            msg.channel.send(embedify('Users with these roles: ', [holders.map(h => [h.user.tag,':',"\"" + (h.nickname || h.user.username) + "\""].join(" "))]))
        } catch {
            msg.channel.send('Users with these roles: \n' + [holders.map(h => [h.user.tag,':',"\"" + (h.nickname || h.user.username) + "\""].join(" "))])
        }
    }
}