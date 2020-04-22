const Discord = require('discord.js')

const hr = '~~- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -~~'

module.exports = {
    hr:hr,
    /**
     * 
     * @param {*} msg Referrer message
     * @param {*} mention The mentioned role from args list
     * Returns an array of [mention, roleID]
     */
    getRoleIDFromMention(msg, mention) {
        const matches = mention.match(/^<@&(\d+)>$/)
        if (!matches) return
        return matches
    },
    /**
     * 
     * @param {String/Array} roles A role ID string, or an array of them
     * @param {*} guild The guild to resolve in
     * Takes either a role id or list of role ids and returns role objects
     */
    async resolveRoleFromID(roles,guild) {
        if (Array.isArray(roles)) {
            resolvedRoles = []
            for (const role of roles) {
                resolvedRoles.push(await guild.roles.fetch(role))
            }
            return resolvedRoles
        } else {
            return guild.roles.fetch(roles)
        }
    },
    /**
     * 
     * @param {String} title The title of the embed card
     * @param {Array} body The body content of the embed card
     * @param {Boolean} thumbnail Display the thumbnail (default false)
     * Format a message into an embed.
     */
    embedify(title,body,thumbnail){
        var embed = new Discord.MessageEmbed()
        .setColor('#b4ebeb')
        .setTimestamp(Date.now())
        
        if (title) embed.setTitle(title)
        if (body){
            for (const elem of body){
                embed.addField(hr,elem)
            }
            
        }
        if (thumbnail) embed.setThumbnail('https://quartzshard.com/images/RoleMan.jpg')

        return embed
    },
    /**
     * 
     * @param {Number} ms Milliseconds to sleep for
     * Will halt an async function for a given time if called with await 
     */
    sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
    }
}