const { getRoleIDFromMention,resolveRoleFromID, resolveMemberFromID,embedify } = require('../common')
const db = require('../db/db')
const conf = db.get('conf')
const {getEmojiIdFromString} = require('../common')

module.exports = {
    name:"self-role-setup",
    description:"Create a set of roles users can assign to themselves by reacting to the message",
    usage:"<emoji> <role> [<emoji> <role>,...]",
    args:true,
    async execute(msg, args) {
        let member = msg.member
        let guild = msg.guild
        if(!member.hasPermission("MANAGE_ROLES")) return msg.channel.send(embedify("Sorry, but you don't have permission do that.",false,{error:true}))
        if (args.length % 2 != 0) return msg.channel.send(embedify("Incorrect number of args specified",false,{error:true}))

        let emojis = []
        let roles = []
        let pairs = []
        for (let len = 0; len < args.length; len+=2){
            let emoji = await getEmojiIdFromString(args[len]) || args[len]
            let role = await resolveRoleFromID(await getRoleIDFromMention(args[len+1])[1],msg.guild)
            emojis.push(emoji)
            roles.push(role)
            pairs.push({emoji:emoji, role:role})
        }

        let violations = roles.filter(e => e.comparePositionTo(member.roles.highest) > 0)
        if (process.env.DEBUG) console.log(violations, violations.length)
        if (violations.length != 0) return msg.channel.send(embedify("Sorry, but you don't have permission do that.",false,{error:true}))

        let guildConf = await conf.findOne({guildID:msg.guild.id})
        guildConf.selfRoles = pairs
        guildConf.save()
        let content = []
        for (let i in roles) {
            if (/^[0-9]+$/.test(emojis[i])) emojis[i] = await guild.emojis.resolve(emojis[i])
            content.push(`${emojis[i]}: ${roles[i]}`)
        }
        msg.channel.send(embedify("The following roles are available:",[content]))
        .then(async (reply) => {
            await emojis.forEach(async e => {
                if(e.guild) {
                    r = guild.emojis.resolve(e).identifier
                } else {
                    r = e
                }
                await reply.react(r)
            } )
        }) 
        msg.delete()

        
    }
}