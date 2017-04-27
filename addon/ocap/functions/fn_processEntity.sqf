/*
  Author: Shakan

  Description:
  Captures unit/vehicle data (including dynamically spawned AI/JIP players) during a mission for playback.
  Compatible with dynamically spawned AI and JIP players.
*/
#define CNTR_EVENT_MOVED "M"

private _entity = _this;

private _entityNotInitialized = (_entity getVariable ["cntr_id", ""]) isEqualTo "";

if (alive _entity and _entityNotInitialized) then {
  _entity call cntr_fnc_initEntity;
} else {
  if (not isNull objectParent _entity) exitWith {};

  private _previousPose = _entity getVariable ["cntr_previousPose", ["", "", ""]];

  (getPosWorld _entity) params ["_positionX", "_positionY"];
  private _currentPose = [
    _positionX call cntr_fnc_round,
    _positionY call cntr_fnc_round,
    round (getDir _entity)
  ];

  if (not (_previousPose isEqualTo _currentPose)) then {
    private _event = [CNTR_EVENT_MOVED, _entity getVariable ["cntr_id", ""]];

    {
      if ((_previousPose select _x) isEqualTo (_currentPose select _x)) then {
        _event pushBack "";
      } else {
        _event pushBack (_currentPose select _x);
      };
    } forEach [0, 1, 2];

    _entity setVariable ["cntr_previousPose", _currentPose];

  	_event call cntr_fnc_writeEvent;
  };
};
