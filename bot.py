## Initialization
import os
import re
import json
import atexit
import discord
import lib 
from discord.ext import commands
from discord_slash import SlashCommand

## Constants and Config
intents = discord.Intents.default()
intents.members = lib.cfg['discord']['intents']['members']
intents.guilds = lib.cfg['discord']['intents']['guilds']
intents.reactions = lib.cfg['discord']['intents']['reactions']

## Define RoleMan bot class
class roleManBot(commands.Bot):
    def __init__(self, *args, **kwargs):
        super().__init__(*args,**kwargs)
        self.remove_command('help')
        
        ## Retrieve emoji : role map
        try:
            with open("guildConf.json","r") as file:
                self.guildConf = json.load(file)
        except FileNotFoundError:
            self.guildConf = {}
            
        ## Load Cogs
        for root, subdirs, files in os.walk("./cogs"):
            if not ("__pycache__" in root):
                for file in files:
                    if file.endswith(".py") and not (file == "help.py" or file == "about.py"):
                        name = file[:-3]
                        parent = ".".join(re.findall(r"\w+",root))
                        self.load_extension(f"{parent}.{name}")

    
    async def on_ready(self):
        self.load_extension("cogs.utils.help")
        self.load_extension("cogs.utils.about")
        lib.log('--------------------------------')
        lib.log('Bot Ready.')
        lib.log(f'Logged in as {self.user.name}')
        lib.log(f'User ID: {self.user.id}')
        lib.log('--------------------------------')

    async def on_guild_join(self, guild):
        self.guildConf[guild.id] = {
            "selfrole":{}
        }
    
    async def on_guild_remove(self,guild):
        del self.guildConf[guild.id]
    
    async def on_command_error(self, ctx, err):
        embed=lib.embed(
            title="Error running command:",
            description=err.args[0],
            colour=lib.errorColour
        )
        await ctx.send(embed=embed)

    def shutdown(self):
        with open("guildConf.json","w+") as file:
            json.dump(self.guildConf,file)

## Create an instance of the bot
botClient = roleManBot(lib.cfg['options']['prefix'], intents=intents)
atexit.register(botClient.shutdown)
#slash = SlashCommand(botClient,True)
botClient.run(lib.cfg['discord']['token'])