const {smartRoleResolver, embedify} = require('../common')

module.exports = {
    name: "resolve-role",
    description: "Resolve a role from a mention, id or name",
    usage: "<@role>, <role name>, <roleid>",
    args: true,
    async execute(msg, args) {
        let guild = msg.guild
        if (Array.isArray(args)) {
            args = args.join(" ")
        }
        let resRole = await smartRoleResolver(args, guild)
        if (!resRole) return msg.channel.send(embedify(`Couldn't find a role by the search term ${args}.`))
        return msg.channel.send(embedify(`Here's the breakdown for @${resRole.name}`,[[
            `Role name: ${resRole.name}`,
            `Role id: ${resRole.id}`,
            `Internal role name: \\<@&${resRole.id}>`,
            `Role colour: 0x${resRole.color.toString(16)}`
        ]]))
    }
} 