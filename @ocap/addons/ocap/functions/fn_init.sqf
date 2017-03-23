/*
    Author: Shakan

    Description:
    Entry point. Initializes and starts capture loop.
*/

#include "\userconfig\ocap\config.hpp";

"OCAP v2.0.0 - by Shakan" call ocap_fnc_logDebug;

if (ocap_debug) then { player call ocap_fnc_addDebugPlayerActions; };

[] call ocap_fnc_startCapture;
