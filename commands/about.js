const {embedify} = require('../common')

module.exports = {
    name:"about",
    description:"A link to the GitHub Repository",
    aliases:["github","source","dev","development","contribute"],
    cooldown:10,
    execute(msg){
        msg.channel.send(embedify("[RoleMan on GitHub]",false,false,"https://github.com/QuartzShard/roleman"))
    }
}