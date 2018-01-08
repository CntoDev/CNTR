/*
    Author: Shakan

    Description:
    Entry point. Initializes and starts capture loop.
*/

#include "\userconfig\cntr\config.hpp";

cntr_captureRunning = false;

"Starting CNTR" call cntr_fnc_logDebug;

if (cntr_debug) then { player call cntr_fnc_addDebugPlayerActions; };

[] call cntr_fnc_startCapture;
