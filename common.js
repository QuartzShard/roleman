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
    getRoleIDFromMention(mention) {
        const matches = mention.match(/^<@&(\d+)>$/)
        if (!matches && mention == "@everyone"){
            return ["@everyone","@everyone"]
        } else if (!matches) return
        
        return matches
    },
    /**
     * 
     * @param {*} msg Referrer message 
     * @param {*} mention The mentioned user from args list
     * Returns an array of [mention,userID]
     */
    getUserIDFromMention(mention) {
        const matches = mention.match(/^<@!?(\d+)>$/)
        if (!matches) return
        return matches
    },
    /**
     * 
     * @param {*} mention A discord mention
     * Returns {type:"role"/"user"/null,mention:mention}
     */
    async determineMentionType(mention){
        if(/^<@&(\d+)>$/.test(mention)|| mention == "@everyone") return {type:"role", mention:mention}
        if(/^<@!?(\d+)>$/.test(mention))return {type:"user", mention:mention}
        return {type:null, mention:mention}
    },
    /**
     * 
     * @param {*} roleID Role to get holders of
     * @param {*} guild Guild to check in
     * Returns a collection of all users with a given role in a given guild
     * If no role if passed, or if @everyone is passed, will return all users
     */
    async getUsersFromRole(roleID,guild){
        const allUsers = await guild.members.fetch()
        if (roleID && roleID != "@everyone") {
            const users = await allUsers.filter(u => u.roles.cache.some(r => r.id == roleID));
            return users
        } else {
            return allUsers
        }
        
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
                await resolvedRoles.push(await guild.roles.cache.find(r => r.id == role))
            }
            return resolvedRoles
        } else {
            return await guild.roles.cache.find(r => r.id == roles)
        }
    },
    /**
     * 
     * @param {*} id User's ID
     * @param {*} guild Guid to resolve in
     * Gets a member given a User and a guild
     */
    async resolveMemberFromID(id,guild) {
        const member = await guild.members.cache.find(m => m.user.id = id)
        return member
    },
    /**
     * 
     * @param {String} title The title of the embed card
     * @param {Array} body The body content of the embed card
     * @param {Object} options A set of boolean options
     * Format a message into an embed.
     * Valid options include url, thumbnail, error
     */
    embedify(title,body,options){
        var embed = new Discord.MessageEmbed()
        .setTimestamp(Date.now())

        if (!options) options = {}
        
        if (title) embed.setTitle(title)
        if (body){
            for (const elem of body){
                embed.addField(hr,elem)
            }
        }
        if (options.url) embed.setURL(url)
        if (options.thumbnail) embed.setThumbnail('https://quartzshard.com/images/RoleMan.jpg')
        if (options.error) {
            embed.setColor('#FF0000')
        } else {
            embed.setColor('#b4ebeb')
        }
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