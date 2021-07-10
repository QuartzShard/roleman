## Initialisation
import discord

## Get a role objet given a name, mention or id and a guild
async def getRole(nameOrID, guild):
    if type(nameOrID) is str:
        if nameOrID.isdigit():
            return guild.get_role(int(nameOrID))
        else:
            for role in guild.roles:
                if role.name == nameOrID or role.mention == nameOrID:
                    return role
            return None
    elif type(nameOrID) is int:
        return guild.get_role(nameOrID)
    else:
        return None
