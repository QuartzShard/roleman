const {getRoleIDFromMention,determineMentionType,getUsersFromRole,getUserIDFromMention,resolveRoleFromID,resolveMemberFromID,embedify} = require('../common')

module.exports = {
    name:"add-role",
    aliases:["addrole"],
    description:"Add a role to all specified users and groups",
    usage:"<@role to assign> <@target> [<@target,...]",
    args:true,
    async execute(msg, args){
        const member = await resolveMemberFromID(msg.author.id,msg.guild)
        if(!member.hasPermission("MANAGE_ROLES")) return msg.reply(embedify("Sorry, but you don't have permission do that."))
        const addRole = args.shift()
        if (args == []) return msg.channel.send(embedify("No target users specified"))
        const addRoleID = await getRoleIDFromMention(addRole)[1]
        const addRoleRes = await resolveRoleFromID(addRoleID,msg.guild)
        if (addRoleRes.comparePositionTo(member.roles.highest) > 0) return msg.reply(embedify("Sorry, but you don't have permission do that."))
        for (const arg of args) {
            const typedArg = await determineMentionType(arg)
            switch (typedArg.type) {
                case "role":
                    const targetRoleID = await getRoleIDFromMention(typedArg.mention)[1]
                    const users = await getUsersFromRole(targetRoleID,msg.guild)
                    await users.each(u => u.roles.add(addRoleRes))
                    break;
                case "user":
                    const userID = await getUserIDFromMention(typedArg.mention)[1]
                    const addMember = await resolveMemberFromID(userID,msg.guild)
                    await addMember.roles.add(addRoleRes)
                    break;
                case null:
                default:
            }
        }
        return msg.channel.send(embedify("Role added to target user (groups)"))

    }

}
