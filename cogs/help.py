## Initialization
import lib
import discord
from discord.ext import commands, tasks

class help(commands.Cog):
    def __init__(self,bot):
        self.bot = bot
        self.description = f"Display help about {self.bot.user.name}'s commands"
        self.usage = f"""
        {self.bot.command_prefix}help
        {self.bot.command_prefix}help <command>
        """
        self.forbidden = False
        
    
    @commands.command()
    async def help(self, ctx, *args):
        prefix = self.bot.command_prefix
        if (args) :
            command = self.bot.get_cog(args[0])
            if (not command.forbidden):
                embed=lib.embed(
                    title=command.qualified_name,
                    description=command.description,
                    sections=[("Usage",command.usage)]
                )
        else:
            cogs = []
            for cog in self.bot.cogs:
                cog = self.bot.get_cog(cog)
                if (not cog.forbidden):
                    cogs.append((cog.qualified_name,cog.description))
            embed=lib.embed(
                title="List of commands:",
                sections=cogs,
                footer=f"Use {self.bot.command_prefix}help <command> to get more specific usage information."
            )            
        await ctx.send(embed=embed)

def setup(bot):
    bot.add_cog(help(bot))
