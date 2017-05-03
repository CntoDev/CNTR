/*
	Author: Shakan

	Description:
	Adds various relevant event handlers to given entity.
*/
#define CNTR_EVENT_GOT_IN "I"
#define CNTR_EVENT_GOT_OUT "O"
#define CNTR_EVENT_DESPAWNED "X"
#define CNTR_EVENT_HIT "H"

private _entity = _this;

private _firedEventHandler = _entity addEventHandler ["Fired", { params ["_shooter", "", "", "", "", "", "_projectile"];
  [_shooter, _projectile] spawn cntr_fnc_eventHandlerFired;
}];

private _hitEventHandler = _entity addEventHandler ["Hit", { params ["_victim", "", "", "_instigator"];
  [CNTR_EVENT_HIT, _victim, _instigator] call cntr_fnc_eventHandlerShot;
}];

private _gotInEventHandler = _entity addEventHandler ["GetIn", { params ["_vehicle", "", "_entity"];
  if (alive _entity and ((_entity getVariable ["cntr_id", ""]) isEqualTo "")) then {
    _entity call cntr_fnc_initEntity;
  };
  if (alive _vehicle and ((_vehicle getVariable ["cntr_id", ""]) isEqualTo "")) then {
    _vehicle call cntr_fnc_initEntity;
  };

  [CNTR_EVENT_GOT_IN, _entity getVariable ["cntr_id", ""], _vehicle getVariable ["cntr_id", ""]] call cntr_fnc_writeEvent;
}];

private _gotOutEventHandler = _entity addEventHandler ["GetOut", { params ["_vehicle", "", "_entity"];
  if (alive _entity and ((_entity getVariable ["cntr_id", ""]) isEqualTo "")) then {
    _entity call cntr_fnc_initEntity;
  };
  if (alive _vehicle and ((_vehicle getVariable ["cntr_id", ""]) isEqualTo "")) then {
    _vehicle call cntr_fnc_initEntity;
  };

  [CNTR_EVENT_GOT_OUT, _entity getVariable ["cntr_id", ""], _vehicle getVariable ["cntr_id", ""]] call cntr_fnc_writeEvent;
}];

private _despawnedEventHandler = _entity addEventHandler ["Deleted", { params ["_entity"];
  [CNTR_EVENT_DESPAWNED, _entity getVariable ["cntr_id", ""]] call cntr_fnc_writeEvent;
  _entity call fn_removeEntityEventHandlers;
}];

_entity setVariable ["cntr_eventHandlers", [
  ["Fired", _firedEventHandler],
  ["Hit", _hitEventHandler],
  ["GetIn", _gotInEventHandler],
  ["GetOut", _gotOutEventHandler],
  ["Delete", _despawnedEventHandler]
]];
