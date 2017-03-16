/*
	Author: Shakan

	Description:
	Captures unit/vehicle data (including dynamically spawned AI/JIP players) during a mission for playback.
	Compatible with dynamically spawned AI and JIP players.
*/
#define OCAP_EVENT_SPAWNED "S"
#define OCAP_EVENT_GOT_IN "I"

private _entity = _this;
private _vehicle = objectParent _entity;

ocap_nextEntityId = ocap_nextEntityId + 1;

_entity setVariable ["ocap_id", ocap_nextEntityId];
_entity call ocap_fnc_addEntityEventHandlers;

if (_entity isKindOf "Man") then {
	[
		OCAP_EVENT_SPAWNED, ocap_nextEntityId, "Man", name _entity,
		groupID (group _entity), str (side _entity), parseNumber (isPlayer _entity), parseNumber (_entity in allCurators)
	] call ocap_fnc_writeEvent;
} else {
	[
		OCAP_EVENT_SPAWNED, ocap_nextEntityId, _entity call ocap_fnc_getVehicleKind,
		getText (configFile >> "CfgVehicles" >> typeOf _entity >> "displayName")
	] call ocap_fnc_writeEvent;
};

if (_entity isKindOf "Man" and not (isNull _vehicle)) then {
	_vehicleNotInitialized = (_vehicle getVariable ["ocap_id", ""]) isEqualTo "";
  if (alive _vehicle and _vehicleNotInitialized) then { _vehicle call ocap_fnc_initEntity; };

	[OCAP_EVENT_GOT_IN, _entity getVariable ["ocap_id", ""], _vehicle getVariable ["ocap_id", ""]] call ocap_fnc_writeEvent;
};
