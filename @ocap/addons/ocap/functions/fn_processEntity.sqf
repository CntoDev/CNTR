/*
  Author: Shakan

  Description:
  Captures unit/vehicle data (including dynamically spawned AI/JIP players) during a mission for playback.
  Compatible with dynamically spawned AI and JIP players.
*/
#define OCAP_EVENT_MOVED "M"

_entity = _this;

_entityNotInitialized = (_entity getVariable ["ocap_id", ""]) isEqualTo "";

if (alive _entity and _entityNotInitialized) then { _entity call ocap_fnc_initEntity; };
if (not isNull objectParent _entity) exitWith {};

_previousPose = _entity getVariable ["ocap_previousPose", ["", "", ""]];

(getPosWorld _entity) params ["_positionX", "_positionY"];
_currentPose = [
  _positionX call ocap_fnc_round,
  _positionY call ocap_fnc_round,
  round (getDir _entity)
];

if (not (_previousPose isEqualTo _currentPose)) then {
  _event = [OCAP_EVENT_MOVED, _entity getVariable ["ocap_id", ""]];

  {
    if ((_previousPose select _x) isEqualTo (_currentPose select _x)) then {
      _event pushBack "";
    } else {
      _event pushBack (_currentPose select _x);
    };
  } forEach [0, 1, 2];

  _entity setVariable ["ocap_previousPose", _currentPose];

	_event call ocap_fnc_writeEvent;
};
