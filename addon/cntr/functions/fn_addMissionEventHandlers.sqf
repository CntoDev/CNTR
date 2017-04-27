/*
	Author: Shakan

	Description:
	Attaches relevant mission event handlers.
*/
#define CNTR_EVENT_CONNECTED "C"
#define CNTR_EVENT_RESPAWNED "R"
#define CNTR_EVENT_DISCONNECTED "D"
#define CNTR_EVENT_KILLED "K"

private _hanldeEntityKilledIndex = addMissionEventHandler ["EntityKilled", { params ["_victim", "", "_instigator"];
	if (not ((_victim getVariable ["cntr_id", ""]) isEqualTo "")) then {
		[CNTR_EVENT_KILLED, _victim, _instigator] call cntr_fnc_eventHandlerShot;

		_victim call cntr_fnc_removeEntityEventHandlers;
	};
}];
cntr_missionEventHandlers pushBack ["EntityKilled", _hanldeEntityKilledIndex];

private _handleEntityRespawnedIndex = addMissionEventHandler ["EntityRespawned", { params ["_newEntity", "_oldEntity"];
	if (not ((_oldEntity getVariable ["cntr_id", ""]) isEqualTo "")) then {

		_newEntity setVariable ["cntr_id", _oldEntity getVariable ["cntr_id", ""]];
		_oldEntity setVariable ["cntr_id", nil];

		_newEntity call cntr_fnc_addEntityEventHandlers;

		[CNTR_EVENT_RESPAWNED, _newEntity getVariable ["cntr_id", ""]] call cntr_fnc_writeEvent;
	};
}];
cntr_missionEventHandlers pushBack ["EntityRespawned", _handleEntityRespawnedIndex];

private _handleHandleDisconnectIndex = addMissionEventHandler ["HandleDisconnect", { params ["_entity", "", "_uid", "_name"];
	[CNTR_EVENT_DISCONNECTED, _name] call cntr_fnc_writeEvent;
	false;
}];
cntr_missionEventHandlers pushBack ["HandleDisconnect", _handleHandleDisconnectIndex];

private _handlePlayerConnectedIndex = addMissionEventHandler ["PlayerConnected", { params ["", "_uid", "_name"];
  [CNTR_EVENT_CONNECTED, _name] call cntr_fnc_writeEvent;
}];
cntr_missionEventHandlers pushBack ["PlayerConnected", _handlePlayerConnectedIndex];

if (cntr_endCaptureOnEndMission) then {
	private _handleEndedIndex = addMissionEventHandler ["Ended", {
		[] call cntr_fnc_stopCapture;
		["stop", cntr_exportPath] call cntr_fnc_export;
	}];
	cntr_missionEventHandlers pushBack ["Ended", _handleEndedIndex];
};
