const {embedify} = require('../common') 

module.exports = {
    name:'shiansc',
    description:'Declare your writing plans',
    forbidden:true,
    cooldown:30,
    execute(msg,args) {
        msg.channel.send(embedify(`I'm FUCKING tired if my friends saying my writing is shit because it's old so I'm FUCKING writing some GODDAMN erotica and nobody can FUCKING stop me!\n\`open to suggestions\``))
    }
}