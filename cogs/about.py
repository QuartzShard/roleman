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
        embed=lib.embed(
            title="About Roleman",
            description="A modular rike-management bot. Find us on github!",
            url="https://github.com/QuartShard/roleman",
            thumbnail=True
        )
        await ctx.send(embed=embed)
    
def setup(bot):
    bot.add_cog(about(bot))
