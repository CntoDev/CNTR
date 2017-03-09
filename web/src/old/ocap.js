

var imageSize = null;
var multiplier = null;
var trim = 0; // Number of pixels that were trimmed when cropping image (used to correct unit placement)
var mapMinZoom = 1;
var mapMaxNativeZoom = 6;
var mapMaxZoom = mapMaxNativeZoom+3;
var map = null;
var mapPanes = null;
var frameCaptureDelay = 1000; // Delay between capture of each frame in-game (ms). Default: 1000
var playbackMultiplier = 10; // Playback speed. 1 = realtime.
var maxPlaybackMultiplier = 60; // Max speed user can set playback to
var minPlaybackMultiplier = 1; // Min speed user can set playback to
var playbackMultiplierStep = 1; // Playback speed slider increment value
var playbackPaused = true;
var playbackFrame = 0;
var entityToFollow = null; // When set, camera will follow this unit

const ui = {

};
let entities = {};
let groups = {};
let gameEvents = [];
let worlds = null;

const icons = createIcons();
const mapDiv = document.getElementById("map");


const mapIndexUrl = "images/maps/maps.json";
const captureIndexUrl = "data/index.json";

(function initOCAP() {
	return Promise.all([
			fetch(mapIndexUrl).then(response => response.json()),
    	fetch(captureIndexUrl).then(response => response.json()),
	]).then(([mapIndex, captureIndex]) => {
    //ui.setModalOpList(opList);
    //window.addEventListener("keypress", event => event.charCode === 32 && event.preventDefault());
	});

}());

// Read operation JSON data and create unit objects
function loadCaptureFile(captureFilePath) {
  return fetch(captureFilePath).then(response => parse(response.text())).then(({ header, events }) => {

    ui.setMissionName(header.missionName);
    ui.setMissionEndTime(events.length);

    initMap(worlds.find(world => world.worldName.toLowerCase() == header.worldName.toLowerCase()), header.worldName);
    toggleHitEvents(false);
    startPlaybackLoop();
    ui.hideModal();
  }).catch(error => {
    ui.modalBody.innerHTML = `Error: "${filepath}" failed to load.<br/>${error}.`;
  });
}

function initMap(world, worldName) {
	map = L.map('map', {
		zoomControl: false,
		zoomAnimation: true,
		scrollWheelZoom: false,
		fadeAnimation: true,
		crs: L.CRS.Simple,
		attributionControl: false,
		zoomSnap: 0.1,
		zoomDelta: 1,
		closePopupOnClick: false
	}).setView([0,0], mapMaxNativeZoom);

	mapPanes = map.getPanes();

	// Hide marker popups once below a certain zoom level
	map.on("zoom", () => ui.hideMarkerPopups = (map.getZoom() <= 7));

	if (world == null) {
		ui.showHint(`Error: Map "${worldName}" is not installed`);
	}

	imageSize = world.imageSize;
	multiplier = world.multiplier;
	map.setView(map.unproject([imageSize/2, imageSize/2]), mapMinZoom);
	
	var mapBounds = new L.LatLngBounds(
		map.unproject([0, imageSize], mapMaxNativeZoom),
		map.unproject([imageSize, 0], mapMaxNativeZoom)
	);
	map.fitBounds(mapBounds);

	// Setup tile layer
	L.tileLayer('images/maps/' + worldName + '/{z}/{x}/{y}.png', {
		maxNativeZoom: mapMaxNativeZoom,
		maxZoom: mapMaxZoom,
		minZoom: mapMinZoom,
		bounds: mapBounds,
		noWrap: true,
		tms: false
	}).addTo(map);

	// Add custom handling for mousewheel zooming
	// Prevents map blurring when zooming in too quickly
	mapDiv.addEventListener("wheel", event => {
		const zoom = event.deltaY > 0 ? -0.5 : 0.5;
		map.zoomIn(zoom, {animate: false});
	});

	map.on("dragstart", () => entityToFollow && entityToFollow.unfollow());

	createInitialMarkers();
}

function createInitialMarkers() {
  Object.values(entities).forEach(function(entity) {
		// Create and set marker for unit
		const pos = entity.getPosAtFrame(0);
		if (pos != null) { // If unit did exist at start of game
			entity.createMarker(armaToLatLng(pos));
		}
	});
}

function createIcons() {
	const unitTypes = [
		{type: 'man', iconSize: [16, 16]},
		{type: 'ship', iconSize: [28, 28]},
		{type: 'parachute', iconSize: [20, 20]},
		{type: 'heli', iconSize: [32, 32]},
		{type: 'plane', iconSize: [32, 32]},
		{type: 'truck', iconSize: [28, 28]},
		{type: 'car', iconSize: [24, 24]},
		{type: 'apc', iconSize: [28, 28]},
		{type: 'tank', iconSize: [28, 28]},
		{type: 'static-mortar', iconSize: [20, 20]},
		{type: 'static-weapon', iconSize: [20, 20]},
		{type: 'unknown', iconSize: [28, 28]},
	];

  const icons = {};
	unitTypes.forEach(([type, iconSize]) => {
    icons[type] = L.icon({iconSize, iconUrl: `images/markers/${type}.svg`});
  });
  return icons;
}

// Converts Arma coordinates [x,y] to LatLng
function armaToLatLng(coords) {
	var pixelCoords = [(coords[0]*multiplier)+trim, (imageSize-(coords[1]*multiplier))+trim];
	return map.unproject(pixelCoords, mapMaxNativeZoom);
};

// Returns date object as little endian (day, month, year) string 
function dateToLittleEndianString(date) {
	return (date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear());
};

function dateToTimeString(date) {
	return date.toISOString().slice(11,19);
}

// Convert time in seconds to a more readable time format
// e.g. 121 seconds -> 2 minutes
// e.g. 4860 seconds -> 1 hour, 21 minutes
function secondsToTimeString(seconds) {
	const mins =  Math.round(seconds / 60);

	if (mins < 60) {
		let minUnit = (mins > 1 ? "mins" : "min");
		
		return `${mins} ${minUnit}`;
	} else {
		let hours = Math.floor(mins/60);
		let remainingMins = mins % 60;
		let hourUnit = (hours > 1 ? "hrs" : "hr");
		let minUnit = (remainingMins > 1 ? "mins" : "min");

		return `${hours} ${hourUnit}, ${remainingMins} ${minUnit}`;
	}
}


function toggleHitEvents(showHint = true) {
	ui.showHitEvents = !ui.showHitEvents;

	let text;
	if (ui.showHitEvents) {
		ui.filterHitEventsButton.style.opacity = 1;
		text = "shown";
	} else {
		ui.filterHitEventsButton.style.opacity = 0.5;
		text = "hidden";
	};

	if (showHint) {
		ui.showHint("Hit events " + text);
	};
};

const lines = [];
function startPlaybackLoop() {

	function playbackFunction() {
		if (!playbackPaused && !(playbackFrame == 0)) {

			requestAnimationFrame(() => {
				// Remove killines & firelines from last frame
        lines.forEach(line => map.removeLayer(line));
        lines.length = 0;
				
				Object.values(entities).forEach(function playbackEntity(entity) {
					//console.log(entity);
					entity.manageFrame(playbackFrame);

					if (entity instanceof Unit) {
						// Draw fire line (if enabled)
						var projectilePos = entity.firedOnFrame(playbackFrame);
						if (projectilePos != null && ui.firelinesEnabled) {
							console.log(entity);
							console.log(`Shooter pos: ${entity.getLatLng()}\nFired event: ${projectilePos} (is null: ${projectilePos == null})`);
							var line = L.polyline([entity.getLatLng(), armaToLatLng(projectilePos)], {
								color: entity.getSideColour(),
								weight: 2,
								opacity: 0.4
							});
							line.addTo(map);
              lines.push(line);
						};
					};
				});

				// Display events for this frame (if any)
				gameEvents.forEach(function playbackEvent(event) {

					// Check if event is supposed to exist by this point
					if (event.frameNum <= playbackFrame) {
						ui.addEvent(event);

						// Draw kill line
						if (event.frameNum == playbackFrame) {
							if (event.type == "killed") {
								var victim = event.victim;
								var killer = event.causedBy;

								// Draw kill line
								if (killer.name != "something") {
									//console.log(victim);
									//console.log(killer);
									var victimPos = victim.getLatLng();
									var killerPos = killer.getLatLng();

									if (victimPos != null && killerPos != null) {
										var line = L.polyline([victimPos, killerPos], {
											color: killer.getSideColour(),
											weight: 2,
											opacity: 0.4
										});
										line.addTo(map);
                    lines.push(line);
									};
								};
							};

							// Flash unit's icon
							if (event.type == "hit") {
								var victim = event.victim;
								victim.flashHit();
							};
						};

					} else {
						ui.removeEvent(event);
					};
				});

				// Handle entityToFollow
				if (entityToFollow != null) {
					var pos = entityToFollow.getPosAtFrame(playbackFrame);
					if (pos != null) {
						map.setView(armaToLatLng(pos), map.getZoom());
					} else { // Unit has died or does not exist, unfollow
						entityToFollow.unfollow();
					};
				};

				playbackFrame++;
				if (playbackFrame == 0) {playbackPaused = true};
				ui.setMissionCurTime(playbackFrame);
			});
		};

		// Run timeout again (creating a loop, but with variable intervals)
		playbackTimeout = setTimeout(playbackFunction, frameCaptureDelay/playbackMultiplier);
	}

	var playbackTimeout = setTimeout(playbackFunction, frameCaptureDelay/playbackMultiplier);
}



function parse(dataString) {
  const [headerData, ...events] = dataString.split(/[\r\n]+/)
      .map(line => line.split(';').filter(entry => entry)
          .map(entry => entry.split(',')
              .map(processEntry)));

  return {
    header: processHeaderData(headerData),
    events,
  };
}

function processHeaderData(data) {
  const [worldName, missionName, author, captureInterval] = data[0];
  return {
    worldName,
    missionName,
    author,
    captureInterval,
  };
}

function processEntry(entry) {
  const number = Number.parseFloat(entry);
  return Number.isNaN(number) ? entry : number;
}
