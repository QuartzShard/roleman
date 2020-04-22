const {getRoleIDFromMention,determineMentionType,getUsersFromRole,getUserIDFromMention,resolveRoleFromID,resolveMemberFromID,embedify} = require('../common')

module.exports = {
    name:"add-role",
    aliases:["addrole"],
    description:"Add a role to all specified users and groups",
    usage:"<@role to assign> <@target> [<@target,...]",
    args:true,
    async execute(msg, args){
        let member = msg.member
        if(!member.hasPermission("MANAGE_ROLES")) return msg.channel.send(embedify("Sorry, but you don't have permission do that.",false,{error:true}))
        let addRole = args.shift()
        if (args == []) return msg.channel.send(embedify("No target users specified",false,{error:true}))
        let addRoleID = await getRoleIDFromMention(addRole)[1]
        let addRoleRes = await resolveRoleFromID(addRoleID,msg.guild)
        if (addRoleRes.comparePositionTo(member.roles.highest) > 0) return msg.channel.send(embedify("Sorry, but you don't have permission do that.",false,{error:true}))
        for (let arg of args) {
            let typedArg = await determineMentionType(arg)
            switch (typedArg.type) {
                case "role":
                    let targetRoleID = await getRoleIDFromMention(typedArg.mention)[1]
                    let users = await getUsersFromRole(targetRoleID,msg.guild)
                    await users.each(u => u.roles.add(addRoleRes))
                    break;
                case "user":
                    let userID = await getUserIDFromMention(typedArg.mention)[1]
                    let addMember = await resolveMemberFromID(userID,msg.guild)
                    await addMember.roles.add(addRoleRes)
                    break;
                case null:
                default:
            }
        }
        return msg.channel.send(embedify("Role added to target user (groups)"))

    }

}
