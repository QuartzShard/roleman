## Initialization
import os
import discord
import lib 
from discord.ext import commands

## Constants and Config
intents = discord.Intents.default()
intents.members = lib.cfg['discord']['intents']['members']

## Define RoleMan bot class
class roleManBot(commands.Bot):
    def __init__(self, *args, **kwargs):
        super().__init__(*args,**kwargs)
        self.remove_command('help')

        ## Load Cogs
        for file in os.listdir("./cogs"):
            if file.endswith(".py"):
                name = file[:-3]
                self.load_extension(f"cogs.{name}")


    async def on_ready(self):
        lib.log('--------------------------------')
        lib.log('Bot Ready.')
        lib.log(f'Logged in as {self.user.name}')
        lib.log(f'User ID: {self.user.id}')
        lib.log('--------------------------------')


## Create an instance of the bot
botClient = roleManBot(lib.cfg['options']['prefix'], intents=intents)
botClient.run(lib.cfg['discord']['token'])