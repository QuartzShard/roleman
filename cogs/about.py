## Initialization
import lib
import discord
from discord.ext import commands, tasks

class about(commands.Cog):
    def __init__(self,bot):
        self.bot = bot
        self.description = f"Display information about {self.bot.user.name}"
        self.usage = f"""
        {self.bot.command_prefix}about
        """
        self.forbidden = False
        
    
    @commands.command()
    async def about(self, ctx, *command):
        embed=discord.Embed(title="About RoleMan", description="A modular role-management bot. Find us on github!", url="https://github.com/QuartzShard/roleman")
        await ctx.send(embed=embed)

def setup(bot):
    bot.add_cog(about(bot))
