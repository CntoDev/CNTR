/*
	Author: Shakan

	Description:
	Captures unit/vehicle data (including dynamically spawned AI/JIP players) during a mission for playback.
	Compatible with dynamically spawned AI and JIP players.
*/
#define CNTR_FORMAT_VERSION "0.3.0"

waitUntil { sleep 1; count allPlayers >= cntr_minPlayerCount and cntr_captureRunning; };

private _header = [
  CNTR_FORMAT_VERSION, worldName, briefingName,
  getMissionConfigValue ["author", "Unknown"], 
  cntr_captureInterval, cntr_exportPath
];

"cntr_exporter" callExtension ["start", _header];

while { cntr_captureRunning and (!cntr_endCaptureOnNoPlayers or count allPlayers >= cntr_minPlayerCount) } do {
  { _x call cntr_fnc_processEntity } forEach entities [["LandVehicle",  "Air", "Ship"], ["Logic"]] + allUnits;
  
  sleep cntr_captureInterval;
  cntr_currentFrameIndex = cntr_currentFrameIndex + 1;
};

if (cntr_captureRunning) then {
  [] call cntr_fnc_stopCapture;
};
