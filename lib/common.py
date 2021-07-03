import datetime
import yaml
import discord

hr='~~- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -~~'

with open("config.yaml", "r") as ymlfile:
    cfg = yaml.load(ymlfile, Loader=yaml.FullLoader)

def log(event):
    now = datetime.datetime.now().strftime("%d,%m,%y %H:%M:%S")
    if cfg['options']['logging']['logToConsole']:
        print(f'[{now}]:{event}')
    if cfg['options']['logging']['logToFile']:
        with open(cfg['options']['logging']['logFilePath'],"a") as logFile:
            logFile.write(f'[{now}]:{event}')

def embed(**kwargs):
    """
    Created an embed from the provided details
    title - Title of embed
    description - Text in embed, pre body
    sections - list of (title,content) tuples
    body - list of entries to be seperated by a <hr>, follows sections
    colour - discord.Colour object to ovveride default
    url - webpage to link to
    thumbnail - boolean to display roleman thumbnail
    footer - Text to put at the bottom of the embed
    """
    embed=discord.Embed()
    if ("title" in kwargs.keys()):
        embed.title = kwargs["title"]
    if ("description" in kwargs.keys()):
        embed.description = kwargs["description"]
    if ("sections" in kwargs.keys()):
        for elem in kwargs["sections"]:
            embed.add_field(name=elem[0],value=elem[1])
    if ("body" in kwargs.keys()):
        for elem in kwargs["body"]:
            embed.add_field(name=hr,value=elem)
    if ("colour" in kwargs.keys()):
        embed.colour = kwargs["colour"]
    elif ("color" in kwargs.keys()):
        embed.color = kwargs["color"] 
    else:
        embed.colour = discord.Colour.from_rgb(0xb4,0xeb,0xeb)
    if ("url" in kwargs.keys()):
        embed.url = kwargs["url"]
    if ("thumbnail" in kwargs.keys()):
        if kwargs["thumbnail"]:
            embed.set_image(url="https://cdn.discordapp.com/avatars/700843606923149352/2e2840d61258ef8a5cc976571cb3851a.png?size=256")
    if ("footer" in kwargs.keys()):
        embed.set_footer(text=kwargs["footer"])
    return embed

