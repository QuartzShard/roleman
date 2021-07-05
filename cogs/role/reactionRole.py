import lib
import discord
from discord.ext import commands, tasks

class reactionRole(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.description = f"Allow users to react to a message to self-assign roles"
        self.usage = f"""
        {self.bot.command_prefix}reactionRole <role name|role ID|@role> <emoji> [<role name|role ID|@role> <emoji>]...
        """
        self.forbidden = False

    @commands.command()
    async def reactionRole(self, ctx, *args):
        guild = ctx.guild
        try:
            guildconf = self.bot.guildConf[guild.id]
        except KeyError:
            self.bot.guildConf[guild.id] = {
                "selfrole":{}
            }
            guildconf = self.bot.guildConf[guild.id]
        if "msgID" in guildconf["selfrole"].keys():
            channel = guild.get_channel(guildconf["selfrole"]["msgID"][0])
            if (channel):     
                try:  
                    message = await channel.fetch_message(guildconf["selfrole"]["msgID"][1])
                    await message.delete()
                except:
                    pass
        roleString = ""
        for i in range(0,len(args),2):
            role = await lib.role.getRole(args[i], guild)
            guildconf["selfrole"][args[i+1]] = role.id
            roleString += f"{args[i+1]} : {role.mention}\n"
        embed = lib.embed(
            title="React to assign yourself a role",
            description=roleString
        )
        reply = await ctx.send(embed=embed)
        guildconf["selfrole"]["msgID"] = (reply.channel.id,reply.id)
        for emoji in guildconf["selfrole"].keys():
            if emoji != "msgID":
                await reply.add_reaction(emoji)
        
    @commands.Cog.listener()
    async def on_reaction_add(self,ctx, *args):
        pass
        
    @commands.Cog.listener()
    async def on_reaction_remove(self, ctx, *args):
        pass

    ## Hiden force json save for debug  
    @commands.command()
    @commands.is_owner()
    async def saveGuildconf(self, ctx):
        self.bot.shutdown()
        await ctx.send(embed = lib.embed(
            title="guildconf saved"
        ))
    

def setup(bot):
    bot.add_cog(reactionRole(bot))
