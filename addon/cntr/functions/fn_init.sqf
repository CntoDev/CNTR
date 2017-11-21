/*
    Author: Shakan

    Description:
    Entry point. Initializes and starts capture loop.
*/

cntr_captureInterval = 1;
cntr_minPlayerCount = 1;
cntr_endCaptureOnEndMission = false;
cntr_endCaptureOnNoPlayers = true;
cntr_usingAce = false;

cntr_exportPath = "/home/steam/ArmA3/";

cntr_debug = false;
cntr_debugLogEvents = false;

#include "\userconfig\cntr\config.hpp";

cntr_captureRunning = false;

"CNTR v2.0.0 - by Shakan" call cntr_fnc_logDebug;

if (cntr_debug) then { player call cntr_fnc_addDebugPlayerActions; };

[] call cntr_fnc_startCapture;
