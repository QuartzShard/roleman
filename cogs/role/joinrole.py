## Initialization
import lib
import discord

from discord.ext import commands

## Class setup
class joinRole(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

        ## Help stuff
        self.category = lib.getCategory(self.__module__)
        self.description = 'Specify a set of roles to add to a user upon joining'
        self.usage = f"""
        {self.bot.command_prefix}joinRole <role> [<role>]...
        """
        self.forbidden = False

    ## Define joinRole callable
    @commands.command()
    @commands.has_guild_permissions(administrator=True)
    async def joinRole(self, ctx, *roles):
        resRoles = []
        failedFlag = False
        for role in roles:
            resRole = await lib.role.getRole(role,ctx.guild)
            if not resRole:
                failedFlag = True
                continue
            resRoles.append(resRole)
        if len(resRoles) > 0:
            try:
                self.bot.guildConf[ctx.guild.id]["joinrole"] = []
            except KeyError:
                self.bot.guildConf[ctx.guild.id] = {
                    "selfrole":{},
                    "joinrole":[]
                }
            roleNames = []
            for role in resRoles:
                self.bot.guildConf[ctx.guild.id]["joinrole"].append(role.id)
                roleNames.append(role.name)
            embed = lib.embed(
                title="Set joinrole(s):",
                description="\n".join(roleNames)
            )
            if failedFlag:
                embed.set_footer(text="Some roles could not be found to add. please try again using @role")
        else:
            embed = lib.embed(
                title="No roles set.",
                colour=lib.errorColour
            )
        await ctx.send(embed=embed)

    ## Listener to add roles on join
    @commands.Cog.listener()
    async def on_member_join(self,member):
        guild = member.guild
        resRoles = []
        for role in self.bot.guildConf[str(guild.id)]["joinrole"]:
            resRoles.append(await lib.role.getRole(role,guild))
        try:
            await member.add_roles(*resRoles)
        except KeyError:
            pass

## Allow use of cog class by main bot instance
def setup(bot):
    bot.add_cog(joinRole(bot))