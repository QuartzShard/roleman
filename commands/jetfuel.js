const { getRoleIDFromMention,resolveRoleFromID, resolveMemberFromID,embedify } = require('../common')
 module.exports = {
     name:"jetfuel",
     forbidden:true,
     async execute(msg, args){
         msg.channel.send(embedify("BUSH DID 9/11",["JET FUEL CAN'T MELT STEEL MEMES", "all of the birds died in 1986 due to reagan killing them and replacing them with spies that are now watching us. the \"birds\" work for the bourgeoisie"]))
     }
 }