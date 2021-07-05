import discord

async def getRole(nameOrID, guild):
    if nameOrID.isdigit():
        return guild.get_role(int(nameOrID))
    elif type(nameOrID) is str:
        for role in guild.roles:
            if role.name == nameOrID or role.mention == nameOrID:
                return role
    else:
        return None