## Initialization
import lib
import discord
from discord.ext import commands, tasks

class help(commands.Cog):
    def __init__(self,bot):
        self.bot = bot
        self.usage = f"{bot.command_prefix}help <command>"
        self.forbidden = False
        
    
    @commands.command()
    async def help(self, ctx, *command):
        prefix = self.bot.command_prefix
        if (command) :
            botCommand = self.bot.get_cog(command[0])
            if (not botCommand.forbidden):
                usage = botCommand.usage
                embed=discord.Embed(title=botCommand.qualified_name, description=usage)
        else:
            embed=discord.Embed(title="Command list:")
            for cog in self.bot.cogs:
                if (not self.bot.get_cog(cog).forbidden):
                    embed.add_field(name=cog,value=self.bot.get_cog(cog).usage,inline=False)
        await ctx.send(embed=embed)

def setup(bot):
    bot.add_cog(help(bot))
