/*
  Author: Shakan

  Description:
	Called when a unit is hit or killed.
*/

params ["_eventType", "_victim", "_shooter"];

private _victimId = _victim getVariable ["cntr_id", ""];

private _event = [_eventType, _victimId];

if (not isNull _shooter) then {
	_event pushBack (_shooter getVariable ["cntr_id", ""]);

	if (_eventType isEqualTo "K") then {
		_event pushBack (getText (configFile >> "CfgWeapons" >> currentWeapon _shooter >> "displayName"));
  };
};

_event call cntr_fnc_writeEvent;
