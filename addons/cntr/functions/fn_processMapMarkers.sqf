/*
  Author: BananaPeel

  Description:
  Handle different event from map marker capture data.
  * Moved a mapmarker
  * Deleted a mapmarker
*/
#define CNTR_EVENT_MARKER_MOVED "G"
#define CNTR_EVENT_MARKER_DELETED "W"


private _marker = _this;

// initialisation of the map marker
_marker call cntr_fnc_initMapMarkers;

private _previousPose = missionNameSpace getVariable (_marker + "cntr_previousMarkerPose");


//
// MOVED
//
(markerPos _marker) params ["_positionX", "_positionY"];
private _currentPose = [
  _positionX call cntr_fnc_round,
  _positionY call cntr_fnc_round,
  round (markerDir _marker)
];

if (not (_previousPose isEqualTo _currentPose)) then {
  	private _moveEvent = [
		CNTR_EVENT_MARKER_MOVED, 
		missionNameSpace getVariable (_marker + "cntr_marker_id")
	];

	{
		if ((_previousPose select _x) isEqualTo (_currentPose select _x)) then {
			_moveEvent pushBack "";
		} else {
			_moveEvent pushBack (_currentPose select _x);
		};
	} forEach [0, 1, 2];

	missionNameSpace setVariable [(_marker + "cntr_previousMarkerPose"), _currentPose];

	_moveEvent call cntr_fnc_writeEvent;
};

// 
// DELETED
// 
private _markerDelete = { params ["_marker"];
	[
		CNTR_EVENT_MARKER_DELETED,
		missionNameSpace getVariable (_marker + "cntr_marker_id")
	] call cntr_fnc_writeEvent;
};

{ //dunno if it would be feasible to make a check if there is any change in array lengths before hand? (minimizes checks - something about big O?)
	if (( allMapMarkers find _x) isEqualTo (-1)) then {
		cntr_previousMapMarkers deleteAt ( cntr_previousMapMarkers find _x);
		_x call _markerDelete;
	}
} forEach cntr_previousMapMarkers;

