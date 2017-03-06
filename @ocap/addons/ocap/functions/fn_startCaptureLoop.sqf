/*
	Author: Shakan

	Description:
	Captures unit/vehicle data (including dynamically spawned AI/JIP players) during a mission for playback.
	Compatible with dynamically spawned AI and JIP players.
*/

waitUntil { sleep 1; count allPlayers >= ocap_minPlayerCount and ocap_captureRunning; };

_header = [worldName, briefingName, getMissionConfigValue ["author", "Unknown"], ocap_captureInterval];

["start", _header joinString ","] call ocap_fnc_export;

while { ocap_captureRunning && (!ocap_endCaptureOnNoPlayers or count allPlayers > 0) } do {
	systemChat "Capturing...";
	{ _x call ocap_fnc_processEntity } forEach entities [["Man", "LandVehicle",  "Air", "Ship"], ["Logic"], true, false];

	sleep ocap_captureInterval;
  ocap_currentFrameIndex = ocap_currentFrameIndex + 1;
};
systemChat "Done!";
sleep ocap_captureInterval;
[] call ocap_fnc_flushWriteBuffer;
["stop", ocap_exportPath] call ocap_fnc_export;
