/*
	Author: Shakan

	Description:
	Adds various relevant event handlers to given entity.
*/
#define OCAP_EVENT_GOT_IN "I"
#define OCAP_EVENT_GOT_OUT "O"
#define OCAP_EVENT_DESPAWNED "X"
#define OCAP_EVENT_HIT "H"

_entity = _this;

_firedEventHandler = _entity addEventHandler ["Fired", { params ["_shooter", "", "", "", "", "", "_projectile"];
  [_shooter, _projectile] spawn ocap_fnc_eventHandlerFired;
}];

_hitEventHandler = _entity addEventHandler ["Hit", { params ["_victim", "", "", "_instigator"];
  [OCAP_EVENT_HIT, _victim, _instigator] call ocap_fnc_eventHandlerShot;
}];

_gotInEventHandler = _entity addEventHandler ["GetIn", { params ["_vehicle", "", "_entity"];
  [OCAP_EVENT_GOT_IN, _entity getVariable ["ocap_id", ""], _vehicle getVariable ["ocap_id", ""]] call ocap_fnc_writeEvent;
}];

_gotOutEventHandler = _entity addEventHandler ["GetOut", { params ["_vehicle", "", "_entity"];
  [OCAP_EVENT_GOT_OUT, _entity getVariable ["ocap_id", ""], _vehicle getVariable ["ocap_id", ""]] call ocap_fnc_writeEvent;
}];

_despawnedEventHandler = _entity addEventHandler ["Delete", { params ["_entity"];
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
