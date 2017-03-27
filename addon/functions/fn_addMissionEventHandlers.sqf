/*
	Author: Shakan

	Description:
	Attaches relevant mission event handlers.
*/
#define OCAP_EVENT_CONNECTED "C"
#define OCAP_EVENT_RESPAWNED "R"
#define OCAP_EVENT_DISCONNECTED "D"
#define OCAP_EVENT_KILLED "K"

private _hanldeEntityKilledIndex = addMissionEventHandler ["EntityKilled", { params ["_victim", "", "_instigator"];
	if (not ((_victim getVariable ["ocap_id", ""]) isEqualTo "")) then {
		[OCAP_EVENT_KILLED, _victim, _instigator] call ocap_fnc_eventHandlerShot;

		{ _victim removeEventHandler _x; } forEach (_victim getVariable "ocap_eventHandlers");
	};
}];
ocap_missionEventHandlers pushBack ["EntityKilled", _hanldeEntityKilledIndex];

private _handleEntityRespawnedIndex = addMissionEventHandler ["EntityRespawned", { params ["_newEntity", "_oldEntity"];
	if (not ((_victim getVariable ["ocap_id", ""]) isEqualTo "")) then {

		_newEntity setVariable ["ocap_id", _oldEntity getVariable ["ocap_id", ""]];
		_oldEntity setVariable ["ocap_id", nil];

		_newEntity call ocap_fnc_addEntityEventHandlers;

		[OCAP_EVENT_RESPAWNED, _oldEntity getVariable ["ocap_id", ""]] call ocap_fnc_logDebug;
	};
}];
ocap_missionEventHandlers pushBack ["EntityRespawned", _handleEntityRespawnedIndex];

private _handleHandleDisconnectIndex = addMissionEventHandler ["HandleDisconnect", { params ["_entity", "", "_uid", "_name"];
	[OCAP_EVENT_DISCONNECTED, _uid, _name] call ocap_fnc_writeEvent;
	false;
}];
ocap_missionEventHandlers pushBack ["HandleDisconnect", _handleHandleDisconnectIndex];

private _handlePlayerConnectedIndex = addMissionEventHandler ["PlayerConnected", { params ["", "_uid", "_name"];
  [OCAP_EVENT_CONNECTED, _uid, _name] call ocap_fnc_writeEvent;
}];
ocap_missionEventHandlers pushBack ["PlayerConnected", _handlePlayerConnectedIndex];

if (ocap_endCaptureOnEndMission) then {
	private _handleEndedIndex = addMissionEventHandler ["Ended", {
		[] call ocap_fnc_stopCapture;
	}];
	ocap_missionEventHandlers pushBack ["Ended", _handleEndedIndex];
};
