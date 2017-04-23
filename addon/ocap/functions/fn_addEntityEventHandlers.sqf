/*
	Author: Shakan

	Description:
	Adds various relevant event handlers to given entity.
*/
#define OCAP_EVENT_GOT_IN "I"
#define OCAP_EVENT_GOT_OUT "O"
#define OCAP_EVENT_DESPAWNED "X"
#define OCAP_EVENT_HIT "H"

private _entity = _this;

private _entityNotInitialized = (_entity getVariable ["ocap_id", ""]) isEqualTo "";

private _firedEventHandler = _entity addEventHandler ["Fired", { params ["_shooter", "", "", "", "", "", "_projectile"];
  [_shooter, _projectile] spawn ocap_fnc_eventHandlerFired;
}];

private _hitEventHandler = _entity addEventHandler ["Hit", { params ["_victim", "", "", "_instigator"];
  [OCAP_EVENT_HIT, _victim, _instigator] call ocap_fnc_eventHandlerShot;
}];

private _gotInEventHandler = _entity addEventHandler ["GetIn", { params ["_vehicle", "", "_entity"];
  if (alive _entity and _entityNotInitialized) then {
    _entity call ocap_fnc_initEntity;
  };
  [OCAP_EVENT_GOT_IN, _entity getVariable ["ocap_id", ""], _vehicle getVariable ["ocap_id", ""]] call ocap_fnc_writeEvent;
}];

private _gotOutEventHandler = _entity addEventHandler ["GetOut", { params ["_vehicle", "", "_entity"];
  if (alive _entity and _entityNotInitialized) then {
    _entity call ocap_fnc_initEntity;
  };
  [OCAP_EVENT_GOT_OUT, _entity getVariable ["ocap_id", ""], _vehicle getVariable ["ocap_id", ""]] call ocap_fnc_writeEvent;
}];

private _despawnedEventHandler = _entity addEventHandler ["Delete", { params ["_entity"];
  [OCAP_EVENT_DESPAWNED, _entity getVariable ["ocap_id", ""]] call ocap_fnc_writeEvent;
  _entity call fn_removeEntityEventHandlers;
}];

_entity setVariable ["ocap_eventHandlers", [
  ["Fired", _firedEventHandler],
  ["Hit", _hitEventHandler],
  ["GetIn", _gotInEventHandler],
  ["GetOut", _gotOutEventHandler],
  ["Delete", _despawnedEventHandler]
]];
