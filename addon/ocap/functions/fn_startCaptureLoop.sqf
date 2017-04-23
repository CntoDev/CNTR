/*
	Author: Shakan

	Description:
	Captures unit/vehicle data (including dynamically spawned AI/JIP players) during a mission for playback.
	Compatible with dynamically spawned AI and JIP players.
*/
#define OCAP_FORMAT_VERSION "0.2.0"

waitUntil { sleep 1; count allPlayers >= ocap_minPlayerCount and ocap_captureRunning; };

private _header = [OCAP_FORMAT_VERSION, worldName, briefingName, getMissionConfigValue ["author", "Unknown"], ocap_captureInterval];

["start", _header joinString ","] call ocap_fnc_export;

while { ocap_captureRunning && (!ocap_endCaptureOnNoPlayers or count allPlayers > 0) } do {
	{ _x call ocap_fnc_processEntity } forEach entities [["LandVehicle",  "Air", "Ship"], ["Logic"]] + allUnits;

	sleep ocap_captureInterval;
  ocap_currentFrameIndex = ocap_currentFrameIndex + 1;
};

sleep ocap_captureInterval;
["stop", ocap_exportPath] call ocap_fnc_export;
