## Initialisation
import lib
import discord

from discord.ext import commands, tasks
from discord_slash import cog_ext

## Define roleInfo cog
class roleInfo(commands.Cog):
    ## Initialise with help info
    def __init__(self,bot):
        self.bot = bot       
        self.category = lib.getCategory(self.__module__)
        self.description = f"Display information about a given role"
        self.usage = f"""
        {self.bot.command_prefix}roleInfo <role name>
        {self.bot.command_prefix}roleInfo <role ID>
        {self.bot.command_prefix}roleInfo <@role>
        """
        self.forbidden = False

    ## Callable command to provide information about a given role
    #@cog_ext.cog_slash(name="roleInfo",guild_ids=[860454052264280084])
    @commands.command()
    async def roleInfo(self, ctx, target):
        ## Fetch role
        role = await lib.role.getRole(target,ctx.guild)
        ## Populate embed with info
        if (role):
            holders = role.members
            embed=lib.embed(
                title=f"@{role.name}",
                body=[f"""
                Name: {role.name}
                ID: {role.id}
                Display Seperately: {role.hoist}
                Mentionable: {role.mentionable}
                Holders: {len(holders)}
                """],
                colour=role.colour                
            )
        else:
            embed=lib.embed(
                title="Not a valid role.",
                colour=lib.errorColour
            )
        await ctx.send(embed=embed)
        
def setup(bot):
    bot.add_cog(roleInfo(bot))