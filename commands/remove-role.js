const {getRoleIDFromMention,determineMentionType,getUsersFromRole,getUserIDFromMention,resolveRoleFromID,resolveMemberFromID,embedify} = require('../common')

module.exports = {
    name:"remove-role",
    aliases:["rmrole","delrole"],
    description:"Remove a role from all specified users and groups",
    usage:"<@role remove> <@target> [<@target,...] <delete?>",
    args:true,
    async execute(msg, args){
        let member = msg.member
        if(!member.hasPermission("MANAGE_ROLES")) return msg.channel.send(embedify("Sorry, but you don't have permission do that.",false,{error:true}))
        let delRole = args.shift()
        if (args == []) return msg.channel.send(embedify("No target users specified"))
        if (args[args.length-1] === "true") {
            var delWhenDone = true
            args.pop()
        } else {
            var delWhenDone = false

        }
        let delRoleID = await getRoleIDFromMention(delRole)[1]
        let delRoleRes = await resolveRoleFromID(delRoleID,msg.guild)
        if (delRoleRes.comparePositionTo(member.roles.highest) >= 0) return msg.channel.send(embedify("Sorry, but you don't have permission do that.",false,{error:true}))
        for (let arg of args) {
            let typedArg = await determineMentionType(arg)
            switch (typedArg.type) {
                case "role":
                    let targetRoleID = await getRoleIDFromMention(typedArg.mention)[1]
                    let users = await getUsersFromRole(targetRoleID,msg.guild)
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
                        let userID = await getUserIDFromMention(typedArg.mention)[1]
                        let delMember = await resolveMemberFromID(userID,msg.guild)
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
