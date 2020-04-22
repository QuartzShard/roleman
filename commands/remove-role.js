const {getRoleIDFromMention,determineMentionType,getUsersFromRole,getUserIDFromMention,resolveRoleFromID,resolveMemberFromID,embedify} = require('../common')

module.exports = {
    name:"remove-role",
    aliases:["rmrole","delrole"],
    description:"Remove a role from all specified users and groups",
    usage:"<@role remove> <@target> [<@target,...] <delete?>",
    args:true,
    async execute(msg, args){
        const member = await resolveMemberFromID(msg.author.id,msg.guild)
        if(!member.hasPermission("MANAGE_ROLES")) return msg.reply(embedify("Sorry, but you don't have permission do that."))
        const delRole = args.shift()
        if (args == []) return msg.channel.send(embedify("No target users specified"))
        if (args[args.length-1] === "true") {
            var delWhenDone = true
            args.pop()
        } else {
            var delWhenDone = false

        }
        const delRoleID = await getRoleIDFromMention(delRole)[1]
        const delRoleRes = await resolveRoleFromID(delRoleID,msg.guild)
        if (delRoleRes.comparePositionTo(member.roles.highest) >= 0) return msg.reply(embedify("Sorry, but you don't have permission do that."))
        for (const arg of args) {
            const typedArg = await determineMentionType(arg)
            switch (typedArg.type) {
                case "role":
                    const targetRoleID = await getRoleIDFromMention(typedArg.mention)[1]
                    const users = await getUsersFromRole(targetRoleID,msg.guild)
                    await users.each(u => {
                        try{
                            u.roles.remove(delRoleRes);
                            //delRoleRes.delete(u.user.id)
                        } catch {
                            console.log("role is gone")
                        }
                        
                    })
                    break;
                case "user":
                    try {
                        const userID = await getUserIDFromMention(typedArg.mention)[1]
                        const delMember = await resolveMemberFromID(userID,msg.guild)
                        await delMember.roles.remove(delRoleRes)
                        //await delRoleRes.members.delete(userID)
                    } catch {
                        console.log("role is gone.")
                    }
                    break;
                case null:
                default:
            }
        }
        var res = "Role removed from target user (groups)"
        if (delWhenDone) {
            delRoleRes.delete()
            res += " and deleted"
        }
        return msg.channel.send(embedify(res))

    }

}