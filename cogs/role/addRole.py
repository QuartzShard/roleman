## Initialisation
import discord
import lib

from discord.ext import commands

## Define addRole cog
class addRole(commands.Cog):
    def __init__(self,bot):
        self.bot = bot
        self.category = lib.getCategory(self.__module__)
        self.description = f"Add one or more roles to one or more users"
        self.usage = f"""
        {self.bot.command_prefix}addRole <role> [<role>...] , <user> [<user>...]
        Provide a list of roles, then a comma, then a list of users.
        Lists may be one item long.
        Please note: the bot cannot grant any roles placed above its highest role.
        """
        self.forbidden = False

    ## Callable command
    @commands.command()
    @commands.has_guild_permissions(manage_roles=True)
    @commands.bot_has_guild_permissions(manage_roles=True)
    async def addRole(self,ctx,*args):
        roles = []
        users = []
        ## Sort args
        roleFlag = True
        for i in args:
            if i == ",":
                roleFlag = False
                continue
            if i.endswith(","): 
                roles.append(i[:-1])
                roleFlag = False
                continue
            if roleFlag:
                roles.append(i)
            else:
                users.append(i)
        
        resRoles = []
        for role in roles:
            resRoles.append(await lib.role.getRole(role,ctx.guild))
        if None in resRoles:
            embed = lib.embed(
                title="Role Error",
                description="One or more roles couldn't be found. Try using quotes around names containing spaces, or using @role",
                colour=lib.errorColour
            )
            return await ctx.send(embed=embed)

        for role in resRoles:
            if role > ctx.author.top_role:
                return

        resUsers = []
        for user in users:
            resUsers.append(await lib.role.getMember(user,ctx.guild))
        if None in resUsers:
            embed = lib.embed(
                title="User error",
                description="One or more users couldn't be found. Try using quotes around names containing spaces, or using @user. Names are case sensetive, don't use nicknames.",
                colour=lib.errorColour
            )
            return await ctx.send(embed=embed)

        for user in resUsers:
            await user.add_roles(*resRoles)
            discord.Member.add_roles()
        
        embed = lib.embed(
                title="Success!",
                description=f"Added {len(resRoles)} role(s) to {len(resUsers)} users."
            )
        return await ctx.send(embed=embed)
        


def setup(bot):
    bot.add_cog(addRole(bot))