if (not cntr_captureRunning) exitWith { systemChat "CNTR capture is not running."; };

"Stopping capture." call cntr_fnc_logDebug;

cntr_captureRunning = false;

[] call cntr_fnc_removeMissionEventHandlers;

{
  _x setVariable ["cntr_id", nil];
  _x call cntr_fnc_removeEntityEventHandlers;
} forEach entities [["LandVehicle",  "Air", "Ship"], ["Logic"]] + allUnits;

["stop", cntr_exportPath] call cntr_fnc_export;
