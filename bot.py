## Initialization
import os
import discord
import lib 
from discord.ext import commands
from discord_slash import SlashCommand

## Constants and Config
intents = discord.Intents.default()
intents.members = lib.cfg['discord']['intents']['members']

## Define RoleMan bot class
class roleManBot(commands.Bot):
    def __init__(self, *args, **kwargs):
        super().__init__(*args,**kwargs)
        self.remove_command('help')

        ## Load Cogs
        for root, subdirs, files in os.walk("./cogs"):
            if not ("__pycache__" in root):
                for file in files:
                    if file.endswith(".py") and not (file == "help.py" or file == "about.py"):
                        name = file[:-3]
                        self.load_extension(f"cogs.{name}")

    
    async def on_ready(self):
        self.load_extension("cogs.help")
        self.load_extension("cogs.about")
        lib.log('--------------------------------')
        lib.log('Bot Ready.')
        lib.log(f'Logged in as {self.user.name}')
        lib.log(f'User ID: {self.user.id}')
        lib.log('--------------------------------')

    async def on_command_error(self, ctx, err):
        embed=lib.embed(
            title="Error running command:",
            description=err.args[0],
            colour=lib.errorColour
        )
        await ctx.send(embed=embed)

## Create an instance of the bot
botClient = roleManBot(lib.cfg['options']['prefix'], intents=intents)
slash = SlashCommand(botClient,True)
botClient.run(lib.cfg['discord']['token'])