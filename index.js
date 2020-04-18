require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix} = require("./config.json")

client.once('ready', () => {
	console.log('Ready!');
});

client.on("message", (msg) => {
    if (!msg.content.startsWith(prefix) || msg.author.bot || msg.channel.type === "dm") return;
    var args = msg.content.slice(prefix.length).split(/ +/)
    var command = args.shift().toLowerCase()
    switch(command) {
        case "robotnik":
            if(msg.mentions.users.first() == client.user) {
                target = msg.author
            } else {
                target = msg.mentions.users.first()
            }
            robotnik(target, msg.channel)
            break;
        case "help":
            helpMenu(msg.channel)
          break;
        default:
            msg.reply(`I don't recognize that command, try ${prefix}help`)
      }
})

/**
 * 
 * @param {String} target Target of the callout post
 * Make a callout post on twitter dot com
 */
var robotnik = function(target, channel) {
    if (!target){
        target = "Shadow the Hedgehog"
    }
    channel.send(`***I've come to make an announcement: ${target}'s a bitch-ass motherfucker. He pissed on my fucking wife. That's right, he took his hedgehog fuckin' quilly dick out and he pissed on my fucking wife, and he said his dick was \"THIS BIG\", and I said \"That's disgusting!\" So I'm making a callout post on my Twitter dot com. ${target}, you got a small dick! It's the size of this walnut except WAY smaller! And guess what? Here's what my dong looks like!That's right, baby! All points, no quills, no pillows, look at that, it looks like two balls and a bong! He fucked my wife, so guess what, I'm gonna fuck the Earth! That's right, this is what you get, my SUPER LASER PISS! Except I'm not gonna piss on the Earth, I'm gonna go higher. I'm pissing on the MOON! HOW DO YOU LIKE THAT, OBAMA? I PISSED ON THE MOON, YOU IDIOT!  You have 23 hours before the piss DRRRROPLLLETS hit the fucking Earth! Now get out of my fucking sight, before I piss on you too!***`)
}
/**
 * 
 * @param {*} channel Channel to reply to
 */
var helpMenu = function(channel){
    channel.send("Here's a list of all my commands: \nWIP")
    return
}
client.login(process.env.API_TOKEN);