/*
	Author: Shakan

	Description:
	Captures unit/vehicle data (including dynamically spawned AI/JIP players) during a mission for playback.
	Compatible with dynamically spawned AI and JIP players.
*/
#define CNTR_EVENT_UNIT_SPAWNED "U"
#define CNTR_EVENT_VEHICLE_SPAWNED "V"

private _initEntity = { params ["_entity", "_vehicleId"];
	cntr_nextEntityId = cntr_nextEntityId + 1;

	_entity setVariable ["cntr_id", cntr_nextEntityId];
	_entity call cntr_fnc_addEntityEventHandlers;

  (getPosWorld _entity) params ["_positionX", "_positionY"];

	if (_entity isKindOf "Man") then {
		[
			CNTR_EVENT_UNIT_SPAWNED, cntr_nextEntityId, "Man", name _entity,
			_positionX call cntr_fnc_round,
			_positionY call cntr_fnc_round,
			round (getDir _entity),
			groupID (group _entity), str (side _entity),
			parseNumber (isPlayer _entity),
			parseNumber (_entity in allCurators),
			_vehicleId
		] call cntr_fnc_writeEvent;
	} else {
		[
			CNTR_EVENT_VEHICLE_SPAWNED, cntr_nextEntityId, _entity call cntr_fnc_getVehicleKind,
			getText (configFile >> "CfgVehicles" >> typeOf _entity >> "displayName"),
			_positionX call cntr_fnc_round,
			_positionY call cntr_fnc_round,
			round (getDir _entity)
		] call cntr_fnc_writeEvent;
	};
};

//======================================================================================================================

private _entity = _this;
private _vehicle = objectParent _entity;

private _vehicleId = "";
if (not (isNull _vehicle)) then {
	_vehicleNotInitialized = (_vehicle getVariable ["cntr_id", ""]) isEqualTo "";
  if (alive _vehicle and _vehicleNotInitialized) then { [_vehicle, ""] call _initEntity; };
	_vehicleId = _vehicle getVariable ["cntr_id", ""];
};

[_entity, _vehicleId] call _initEntity;
