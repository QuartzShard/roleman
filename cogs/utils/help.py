## Initialisation
import lib
import discord
import re
from discord.ext import commands, tasks

## Define help cog
class help(commands.Cog):
    ## Initialose with help info
    def __init__(self,bot):
        self.bot = bot
        self.category = re.search(r"cogs\.(\w+)\.",self.__module__).groups()[0]
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
                    sections=[("Usage",command.usage),("Category",command.category)]
                )
        else:
            cogs = {}
            for cog in self.bot.cogs:
                cog = self.bot.get_cog(cog)
                if (not cog.forbidden):
                    if not (cog.category in cogs.keys()):
                        cogs[cog.category] = []
                    cogs[cog.category].append(f"`{cog.qualified_name}`\n> {cog.description}")
            ## Display list of commands and descriptions
            embed=lib.embed(
                title="List of commands:",
                footer=f"Use {self.bot.command_prefix}help <command> to get more specific usage information."
            )
            for category in cogs.keys():
                embed.add_field(name=category,value="\n".join(cogs[category]))
                
        if not (embed):   
            embed=lib.embed(
                title="This command does not exist",
                description=f"Try {self.bot.command_prefix}help to see a list of available commands."
            )       
        await ctx.send(embed=embed)



def setup(bot):
    bot.add_cog(help(bot))
