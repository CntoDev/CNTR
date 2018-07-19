/*
	Author: Shakan
  Contributor: Bananapeel

	Description:
	Captures data of units, vehicles and in-game map markers, during a mission for later playback.
	Compatible with dynamically spawned AI and JIP players.
*/
#define CNTR_FORMAT_VERSION "0.4.0"

waitUntil { sleep 1; count allPlayers >= cntr_minPlayerCount and cntr_captureRunning; };

private _header = [
  CNTR_FORMAT_VERSION, worldName, briefingName,
  getMissionConfigValue ["author", "Unknown"], 
  cntr_captureInterval, cntr_exportPath
];

"cntr_exporter" callExtension ["start", _header];

while { cntr_captureRunning and (!cntr_endCaptureOnNoPlayers or count allPlayers >= cntr_minPlayerCount) } do {
  // loop to process all entities
  { _x call cntr_fnc_processEntity } forEach entities [["LandVehicle",  "Air", "Ship"], ["Logic"]] + allUnits;
  
  // loop to process all mapMarkers
  { if ((markerType _x) isEqualTo ("")) then {
      // Markers of type = "" are hand-drawn markers and are being left out for the time being  
    } else {
      _x call cntr_fnc_processMapMarkers 
    }
  } forEach allMapMarkers;
  
  sleep cntr_captureInterval;
  cntr_currentFrameIndex = cntr_currentFrameIndex + 1;
};

[] call cntr_fnc_stopCapture;
