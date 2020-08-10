const { getRoleIDFromMention,resolveRoleFromID, resolveMemberFromID,embedify } = require('../common')
const db = require('../db/db')
const conf = db.get('conf')

module.exports = {
    name:"self-roles-old",
    forbidden:true,
    description:"See roles you can assign to yourself",
    async execute(msg, args) {
        let author = msg.author
        let member = msg.member

        let guildConf = await conf.findOne({guildID:msg.guild.id})
        let prefix = guildConf.prefix
        let emojis= guildConf.selfRoles.emojis
        let roles = guildConf.selfRoles.roles
        let emojiFilter = (reaction,user) => {
            return emojis.includes(reaction.emoji.name) && !user.bot
        } 
        let resolvedRoles = []
        for (let i of roles) {
            resolvedRoles.push(await resolveRoleFromID(i,msg.guild))
        }
        let content = []
        for (let i in resolvedRoles) {
            content.push(`${emojis[i]}: ${resolvedRoles[i]}`)
        }
        msg.channel.send(embedify("The following roles are available:",[content,`React to this message to be given the corresponding role.\nThis message will be valid for 10 minutes, do \`${prefix}self-roles\`to refresh it afterwards`]))
        .then(async (reply) => {
            await emojis.forEach(async e => await reply.react(e) )
            
            let reactions = reply.createReactionCollector(emojiFilter, {time:600*1000});

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