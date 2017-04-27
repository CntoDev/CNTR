"Starting capture." call cntr_fnc_logDebug;

cntr_captureRunning = true;
cntr_missionEventHandlers = [];
cntr_writeBuffer = "";
cntr_lastWrittenFrameIndex = -1;
cntr_currentFrameIndex = -1;
cntr_nextEntityId = -1;
cntr_nextWeaponId = -1;

[] call cntr_fnc_addMissionEventHandlers;

[] spawn cntr_fnc_startCaptureLoop;
