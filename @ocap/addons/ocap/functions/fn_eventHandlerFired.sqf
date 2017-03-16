/*
  Author: Shakan

  Description:
  Called when a unit fires their weapon. Captures the landing position of the fired projectile.
*/
#define OCAP_EVENT_FIRED "F"

params ["_shooter", "_projectile"];

private _lastPos = [];

waitUntil {
	private _pos = getPosATL _projectile;

	if (((_pos select 2) <= 0) or isNull _projectile) exitWith { true };

	_lastPos = _pos;
	false;
};

if ((count _lastPos) != 0) then {
	[
		OCAP_EVENT_FIRED,
		_shooter getVariable ["ocap_id", ""],
		(_lastPos select 0) call ocap_fnc_round,
		(_lastPos select 1) call ocap_fnc_round
	] call ocap_fnc_writeEvent;
};
