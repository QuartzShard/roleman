## Initialisation
import discord

## Get a role objet given a name, mention or id and a guild
async def getRole(nameOrID, guild):
    if nameOrID.isdigit():
        return guild.get_role(int(nameOrID))
    elif type(nameOrID) is str:
        for role in guild.roles:
            if role.name == nameOrID or role.mention == nameOrID:
                return role
    else:
        return None