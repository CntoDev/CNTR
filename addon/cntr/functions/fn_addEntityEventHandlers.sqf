/*
	Author: Shakan

	Description:
	Adds various relevant event handlers to given entity.
*/
#define CNTR_EVENT_DESPAWNED "X"
#define CNTR_EVENT_HIT "H"

private _entity = _this;

private _firedEventHandler = _entity addEventHandler ["Fired", { params ["_shooter", "", "", "", "", "", "_projectile"];
  [_shooter, _projectile] spawn cntr_fnc_eventHandlerFired;
}];

private _hitEventHandler = _entity addEventHandler ["Hit", { params ["_victim", "", "", "_instigator"];
	private _victimId = _victim getVariable ["cntr_id", ""];
	private _event = [CNTR_EVENT_HIT, _victimId];

	if (not isNull _instigator) then {
		_event pushBack (_instigator getVariable ["cntr_id", ""]);
		_event pushBack (getText (configFile >> "CfgWeapons" >> currentWeapon _instigator >> "displayName"));
	};

	_victim call cntr_fnc_removeEntityEventHandlers;
	_event call cntr_fnc_writeEvent;
}];

private _despawnedEventHandler = _entity addEventHandler ["Deleted", { params ["_entity"];
  [CNTR_EVENT_DESPAWNED, _entity getVariable ["cntr_id", ""]] call cntr_fnc_writeEvent;
  _entity call fn_removeEntityEventHandlers;
}];

_entity setVariable ["cntr_eventHandlers", [
  ["Fired", _firedEventHandler],
  ["Hit", _hitEventHandler],
  ["Delete", _despawnedEventHandler]
]];
