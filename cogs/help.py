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
                usage = command.usage
                embed=discord.Embed(title=command.qualified_name, description=command.description)
                embed.add_field(name="Usage",value=command.usage)
        else:
            embed=discord.Embed(title="Command list:")
            for cog in self.bot.cogs:
                get_cog = self.bot.get_cog
                if (not get_cog(cog).forbidden):
                    embed.add_field(name=lib.hr,value=f"**{cog}**: {get_cog(cog).description}",inline=False)
        await ctx.send(embed=embed)

def setup(bot):
    bot.add_cog(help(bot))
