/*
	Author: Shakan

	Description:
	Attaches relevant mission event handlers.
*/

#define CNTR_EVENT_CONNECTED "C"
#define CNTR_EVENT_RESPAWNED "R"
#define CNTR_EVENT_DISCONNECTED "D"
#define CNTR_EVENT_KILLED "K"

private _handleEntityKilledIndex = addMissionEventHandler ["EntityKilled", { params ["_victim", "", "_killer"];
  private _victimId = _victim getVariable "cntr_id";

  if (not isNil {_victimId}) then {
		private _event = [CNTR_EVENT_KILLED, _victimId];
		
		if (cntr_usingAce and isNull _killer) then {
			_killer =_victim getVariable ["ace_medical_lastDamageSource", objNull];
		};

		if (not isNull _killer) then {
			_event pushBack (_killer getVariable ["cntr_id", ""]);
			_event pushBack (getText (configFile >> "CfgWeapons" >> currentWeapon _killer >> "displayName"));
		};

		_victim call cntr_fnc_removeEntityEventHandlers;
		_event call cntr_fnc_writeEvent;
	};
}];
cntr_missionEventHandlers pushBack ["EntityKilled", _handleEntityKilledIndex];



private _handleEntityRespawnedIndex = addMissionEventHandler ["EntityRespawned", { params ["_newEntity", "_oldEntity"];
  private _entityId = _oldEntity getVariable "cntr_id";

	if (not isNil {_entityId}) then {
		_newEntity setVariable ["cntr_id", _entityId];
		_oldEntity setVariable ["cntr_id", nil];

		_newEntity call cntr_fnc_addEntityEventHandlers;

		[CNTR_EVENT_RESPAWNED, _entityId] call cntr_fnc_writeEvent;
	};
}];
cntr_missionEventHandlers pushBack ["EntityRespawned", _handleEntityRespawnedIndex];



private _handleHandleDisconnectIndex = addMissionEventHandler ["HandleDisconnect", { params ["", "", "", "_name"];
	[CNTR_EVENT_DISCONNECTED, _name] call cntr_fnc_writeEvent;
	false;
}];
cntr_missionEventHandlers pushBack ["HandleDisconnect", _handleHandleDisconnectIndex];



private _handlePlayerConnectedIndex = addMissionEventHandler ["PlayerConnected", { params ["", "", "_name"];
  [CNTR_EVENT_CONNECTED, _name] call cntr_fnc_writeEvent;
}];
cntr_missionEventHandlers pushBack ["PlayerConnected", _handlePlayerConnectedIndex];



if (cntr_endCaptureOnEndMission) then {
	private _handleEndedIndex = addMissionEventHandler ["MPEnded", {
		[] call cntr_fnc_stopCapture;
	}];
	cntr_missionEventHandlers pushBack ["MPEnded", _handleEndedIndex];
};
