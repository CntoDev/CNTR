# This script updates ./data/index.json with the last modified cntr file in ./data/

import json
import glob
import os

# List of available maps.
mapList = []
# Default map if mission map not available.
defaultMap = 'altis'
# Path for cntr data.
cntrDataPath = './data/*.cntr'
# Path for cntr maps.
cntrMapIndexPath = './maps/index.json'

# Make a list of all the available maps by checking the index.json in maps dir.
with open(cntrMapIndexPath) as mapFile:
  mapData = json.load(mapFile)
for i in range(len(mapData)):
  mapList.append(mapData[i]["worldName"])
mapFile.close()

# Find last modifed data file.
fileList = glob.glob(cntrDataPath)
latestFileName = max(fileList, key=os.path.getctime)
# Create time stamp.
timeStamp = int(os.path.getmtime(latestFileName))

# Open the last modified data file.
latestFile = open(latestFileName, "r", errors='replace')
# Count lines in file.
latestFileLines = latestFile.readlines()
lineCount = len(latestFileLines)
# Find mission name.
firstLine = latestFileLines[0]
firstLineElementList = firstLine.split(',')
# Default is "cn-c-" feel free to change if this is not a coop mish.
opName = "cn-c-" + firstLineElementList[2]
# Find map name.
mapName = firstLineElementList[1]
# Get just the file name without the path.
latestFileName = latestFileName.split('\\')[1]

# Check if this map is available otherwise change it to the default map.
if mapName not in mapList:
  mapName = defaultMap

with open('./data/index.json') as f:
  data = json.load(f)

# Save old index as backup just in case.
with open('./index.bak', 'w') as outfile:
    json.dump(data, outfile, indent=4)

# Create new entry.
newValue = {"missionName": opName, "worldName": mapName, "duration": lineCount, "date": timeStamp, "captureFileName": latestFileName}
data.append(newValue)
# Save new index file.
with open('./data/index.json', 'w') as outfile:
    json.dump(data, outfile, indent=4)