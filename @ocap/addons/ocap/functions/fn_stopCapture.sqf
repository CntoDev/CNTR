"Stopping capture." call ocap_fnc_logDebug;

ocap_captureRunning = false;

[] call ocap_fnc_removeMissionEventHandlers;

{
  _x setVariable ["ocap_id", nil];
  _x call ocap_fnc_removeEntityEventHandlers;
} forEach entities [["LandVehicle",  "Air", "Ship"], ["Logic"]] + allUnits;
