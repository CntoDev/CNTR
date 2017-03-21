"Starting capture." call ocap_fnc_logDebug;

ocap_captureRunning = true;
ocap_missionEventHandlers = [];
ocap_writeBuffer = "";
ocap_lastWrittenFrameIndex = -1;
ocap_currentFrameIndex = -1;
ocap_nextEntityId = -1;
ocap_nextWeaponId = -1;

[] call ocap_fnc_addMissionEventHandlers;

[] spawn ocap_fnc_startCaptureLoop;
