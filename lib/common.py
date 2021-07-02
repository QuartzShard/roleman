import datetime
import yaml

with open("config.yaml", "r") as ymlfile:
    cfg = yaml.load(ymlfile, Loader=yaml.FullLoader)

def log(event):
    now = datetime.datetime.now().strftime("%d,%m,%y %H:%M:%S")
    if cfg['options']['logging']['logToConsole']:
        print(f'[{now}]:{event}')
    if cfg['options']['logging']['logToFile']:
        with open(cfg['options']['logging']['logFilePath'],"a") as logFile:
            logFile.writeline(f'[{now}]:{event}')
