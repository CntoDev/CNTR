/*
  Author: Shakan

  Description:
  Captures unit/vehicle data (including dynamically spawned AI/JIP players) during a mission for playback.
  Compatible with dynamically spawned AI and JIP players.
*/
#define CNTR_EVENT_MOVED "M"
#define CNTR_EVENT_GOT_IN "I"
#define CNTR_EVENT_GOT_OUT "O"

private _entity = _this;

_entity call cntr_fnc_initEntity;

private _id = _entity getVariable "cntr_id";

//
// GOT IN / GOT OUT
//

private _previousVehicle = _entity getVariable ["cntr_vehicle", objNull];
private _vehicle = objectParent _entity;

if (not (_previousVehicle isEqualTo _vehicle)) then {

  _entity setVariable ["cntr_vehicle", _vehicle];
  
  if (isNull _vehicle) then {
    [CNTR_EVENT_GOT_OUT, _id] call cntr_fnc_writeEvent;
  } else {
    [CNTR_EVENT_GOT_IN, _id, _vehicle getVariable "cntr_id"] call cntr_fnc_writeEvent;
  };
};

if (not isNull _vehicle) exitWith {};

//
// MOVED
//

private _previousPose = _entity getVariable ["cntr_pose", [-1, -1, -1]];

(getPosWorld _entity) params ["_positionX", "_positionY"];
private _currentPose = [
  _positionX call cntr_fnc_round,
  _positionY call cntr_fnc_round,
  round (getDir _entity)
];

if (not (_previousPose isEqualTo _currentPose)) then {
  private _event = [CNTR_EVENT_MOVED, _id];

  {
    if ((_previousPose select _x) isEqualTo (_currentPose select _x)) then {
      _event pushBack "";
    } else {
      _event pushBack (_currentPose select _x);
    };
  } forEach [0, 1, 2];

  _entity setVariable ["cntr_pose", _currentPose];

  _event call cntr_fnc_writeEvent;
};
