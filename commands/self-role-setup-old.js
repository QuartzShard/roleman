const { getRoleIDFromMention,resolveRoleFromID, resolveMemberFromID,embedify } = require('../common')
const db = require('../db/db')
const conf = db.get('conf')

module.exports = {
    name:"self-role-setup",
    forbidden:true,
    description:"Create a set of roles users can assign to themselves by reacting to the message",
    usage:"<emoji> <role> [<emoji> <role>,...]",
    args:true,
    async execute(msg, args) {
        let author = msg.author
        let member = msg.member
        if(!member.hasPermission("MANAGE_ROLES")) return msg.channel.send(embedify("Sorry, but you don't have permission do that.",false,{error:true}))
        if (args.length % 2 != 0) return msg.channel.send(embedify("Incorrect number of args specified",false,{error:true}))

        let emojis = []
        let roles = []
        for (let len = 0; len < args.length; len+=2){
            emojis.push(args[len])
            roles.push(await resolveRoleFromID(await getRoleIDFromMention(args[len+1])[1],msg.guild))
        }

        let violations = roles.filter(e => e.comparePositionTo(member.roles.highest) > 0)
        if (process.env.DEBUG) console.log(violations, violations.length)
        if (violations.length != 0) return msg.channel.send(embedify("Sorry, but you don't have permission do that.",false,{error:true}))

        let guildConf = await conf.findOne({guildID:msg.guild.id})
        let prefix = guildConf.prefix
        guildConf.selfRoles = {emojis:emojis,roles:roles}
        await guildConf.save()


        let emojiFilter = (reaction,user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot
        }
        let content = []
        for (let i in roles) {
            content.push(`${emojis[i]}: ${roles[i]}`)
        }
        msg.channel.send(embedify("The following roles have been assigned:",[content,`Users can do ${prefix}self-roles to see this menu.`]))
        .then(async (reply) => {
            await emojis.forEach(async e => await reply.react(e) )
            
            let reactions = reply.createReactionCollector(emojiFilter, {time:60*1000});

            reactions.on('collect', async (reaction, user) => {
                let member = await resolveMemberFromID(user.id,reaction.message.guild)
                if (process.env.DEBUG) console.log(`Collected ${reaction.emoji.name} from ${user.tag}`)
                let index = emojis.indexOf(reaction.emoji.name)
                return member.roles.add(roles[index])
            })
            reactions.on("end", (c,r) => {
                if (!c.first()) return
                c.first().message.delete()
            })
    
            //reactions.on('remove', (reaction, user) => {
            //console.log("ping")
            //if (process.env.DEBUG) console.log(`Lost ${reaction.emoji.name} from ${user.tag}`)
            //})
        }) 
        

        
    }
}