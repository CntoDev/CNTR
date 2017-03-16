/*
	Author: Shakan

	Description:
	Determines the kind of a vehicle.
*/

params ["_vehicle"];

private _apcClasses = [
	"Wheeled_APC_F", "Tracked_APC",
	"APC_Wheeled_01_base_F", "APC_Wheeled_02_base_F",
	"APC_Wheeled_03_base_F", "APC_Tracked_01_base_F",
	"APC_Tracked_02_base_F", "APC_Tracked_03_base_F"
];

private _isAnyOf = { params ["_entity", "_classes"];
	_bool = false;
	{ _x params ["_class"];
		if (_entity isKindOf _class) exitWith { _bool = true; };
	} forEach _classes;

	_bool;
};

if (_vehicle isKindOf "Ship") exitWith { "Ship" };
if (_vehicle isKindOf "ParachuteBase") exitWith { "Parachute" };
if (_vehicle isKindOf "Helicopter") exitWith { "Helicopter" };
if (_vehicle isKindOf "Plane") exitWith { "Plane" };
if (_vehicle isKindOf "Air") exitWith { "Plane" };
if ([_vehicle, _apcClasses] call _isAnyOf) exitWith { "APC" };
if (_vehicle isKindOf "Truck_F") exitWith { "Truck" };
if (_vehicle isKindOf "Car") exitWith { "Car" };
if (_vehicle isKindOf "Tank") exitWith { "Tank" };
if (_vehicle isKindOf "StaticMortar") exitWith { "StaticMortar" };
if (_vehicle isKindOf "StaticWeapon") exitWith { "StaticWeapon" };
"Unknown";
