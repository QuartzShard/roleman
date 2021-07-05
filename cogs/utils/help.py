## Initialisation
import lib
import discord
from discord.ext import commands, tasks

## Define help cog
class help(commands.Cog):
    ## Initialose with help info
    def __init__(self,bot):
        self.bot = bot
        self.description = f"Display help about {self.bot.user.name}'s commands"
        self.usage = f"""
        {self.bot.command_prefix}help
        {self.bot.command_prefix}help <command>
        """
        self.forbidden = False
        
    ## Callable command to provide user help with command usage
    @commands.command()
    async def help(self, ctx, *args):
        embed=False
        prefix = self.bot.command_prefix
        ## Provide specific help, or general command list
        if (args) :
            command = self.bot.get_cog(args[0])
            if not (command):
                pass
            ## Gather usage info about command
            elif (not command.forbidden):
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
            ## Display list of commands and desceriptions
            embed=lib.embed(
                title="List of commands:",
                sections=cogs,
                footer=f"Use {self.bot.command_prefix}help <command> to get more specific usage information."
            )
        if not (embed):   
            embed=lib.embed(
                title="This command does not exist",
                description=f"Try {self.bot.command_prefix}help to see a list of available commands."
            )       
        await ctx.send(embed=embed)



def setup(bot):
    bot.add_cog(help(bot))
