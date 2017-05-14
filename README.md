[OCAP_Repo]: https://github.com/mistergoodson/OCAP
[Leaflet]: http://leafletjs.com/
[CarpeNoctem]: http://www.carpenoctem.co/
[Icons8]: https://icons8.com/
[AUTHORS]: https://github.com/CntoDev/CNTR/blob/master/AUTHORS
[LOGO]: https://github.com/CntoDev/CNTR/raw/develop/web/images/cntr-logo.png
[CNTR_Capture]: https://github.com/CntoDev/CNTR/blob/master/docs/cntr-format.md

![CNTR][LOGO]
# Carpe Noctem Tactical Recap (CNTR)

**CNTR** is a recording and playback system for ArmA 3. The system captures infantry and vehicle movement, weapons fire, 
casualties and many other aspects of an armed operation and stores it for later playback in a 2D environment with 
functionality similar to that of the Arma 3 map. **CNTR** thus allows for both planning an operation as well as 
reviewing team-performance and coordination post-operation.

**CNTR** started as a modification [**OCAP**][OCAP_Repo], modified to suit CNTO's specific needs, but eventually ended 
up being a complete rewrite of it with a different capture and playback algorithms, and a completely new storage format.

## Features
* Server-side real-time capturing - no client modding required
* Extensively stress-tested - support for over 300 simultaneously active units on the battlefield!
* Streamable, crash-resistant capture format - capture file is usable as-is even after fatal crashes
* On-the-fly capturing and storage - capture file is ready to use on mission end
* 64-bit platform support
* Interactive web playback system
  * Event ticker with go-to-event and go-to-unit features
  * Interactive unit overview featuring individual unit status
  * Map preview - no capture file required

## Upcoming features (subject to change!)
* Automatic remote upload to another server
* Map drawing capabilities in web player similar to those in Arma 3
* Collaborative web player sessions that allow users to plan and analyze operations outside of ArmA 3
* Capturing and reproduction of in-game placed map markers
* Unit role detection (AR, AT, MEDIC, etc.)

## Installation guide (server-side only!)
*Please note that if the game server is not on the same server as the web player server, capture files will have to be 
transferred manually together with the updated index file! Remote upload feature is in the works.*
* Download & extract the latest CNTR release
* Copy contents of `addon` folder into Arma 3 root folder (i.e. `C:\Games\Arma 3`)
* Copy `player` folder into web server's app folder (i.e. `C:\wamp64\www`) and name it as you wish (in this example, `cntr-player`)
* Open `<Arma 3 root folder>\userconfig\cntr\config.hpp` and modify the following line:
```
cntr_exportPath = "$$WEB_PLAYER_DATA_PATH$$";
```
to include the path where you placed the player, i.e.:
```
cntr_exportPath = "C:\wamp64\www\cntr-player\data";
```
* Make sure the path above is writable, otherwise the addon won't be able to copy the capture file and update the index

## Dev Setup Guide

* Install [Git](https://git-scm.com/)
* Clone CNTR repository to desired folder (in this example, `cntr`): 
```
git clone https://github.com/CntoDev/CNTR.git cntr
```

### Addon
* Install **Arma 3 Tools** from [Steam](http://store.steampowered.com/app/233800/Arma_3_Tools/)
* Open **Arma 3 Tools** and open the **Addon Builder**
* Under **Addon source directory** put the path to the addon source files, i.e. `cntr\addon\cntr`
* Under **Destination directory** put the path where the bundle should appear, such as directly to the Arma 3 folder: 
`<Arma 3 root folder>\@cntr\addons\`
* Make sure the `Binarize` option is deselected!
* Click on **PACK** to create the addon bundle

### Extension
* Install [Visual Studio 2017 Community Edition](https://www.visualstudio.com/vs/)
* During installation, make sure C# features are enabled
* Open `cntr\extension\CNTRExporter.sln` (`.sln` extension should be automatically associated with Visual Studio after 
installation)
* Under `Build` menu, select `Build solution`
* Compiled DLLs will appear in `cntr\extension\bin\x86\Release` and `cntr\extension\bin\x64\Release`, for `x86` and 
`x64` platforms, respectively

### Web player
* Install latest version of [Node.js](https://nodejs.org/en/)
* Run `npm install`
* To bundle the app, run `npm run build`
* To start the watcher, run `npm run watch`
* To build for production (minified), run `npm run build:prod`

## CNTR capture format
CNTR uses its own human-readable capture format inspired by CSV and YAML formats. Please see the 
[following document][CNTR_Capture] for detailed documentation.

## Credit list
* [Carpe Noctem's R&D team][CarpeNoctem]
* [Individuals highlighted in AUTHORS.md][AUTHORS]
* [Leaflet library][Leaflet]
* [UI icons by Icons8][Icons8]
* [Mistergoodson's original work on **OCAP**][OCAP_Repo]
