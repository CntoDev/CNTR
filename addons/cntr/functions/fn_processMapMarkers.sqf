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


//
// MOVED
//
private _markerMoved = { params ["_marker"]; 
	private _moveEvent = [
		CNTR_EVENT_MARKER_MOVED, 
		missionNameSpace getVariable (_marker + "cntr_marker_id")
	];

	{
		if (not ((_previousPose select _x) isEqualTo (_currentPose select _x))) then {
			_moveEvent pushBack (_currentPose select _x);
		};
	} forEach [0, 1, 2];
	_moveEvent call cntr_fnc_writeEvent;
};

private _previousPose = missionNameSpace getVariable (_marker + "cntr_previousMarkerPose");
private _position = markerPos _marker;

private _currentPose = [
	(_position select 0) call cntr_fnc_round,
	(_position select 1) call cntr_fnc_round,
	round (markerDir _marker)
];

if (not (_previousPose isEqualTo _currentPose)) then {
	missionNameSpace setVariable [(_marker + "cntr_previousMarkerPose"), _currentPose];

	[ _marker] call _markerMoved;
};

// 
// DELETED
// 
private _markerDeleted = { params ["_marker"];
	[
		CNTR_EVENT_MARKER_DELETED,
		missionNameSpace getVariable (_marker + "cntr_marker_id")
	] call cntr_fnc_writeEvent;
};

if ( not ( allMapMarkers isEqualTo cntr_previousMapMarkers) ) then {
	{ 
		if (( allMapMarkers find _x) isEqualTo (-1)) then {
			cntr_previousMapMarkers deleteAt ( cntr_previousMapMarkers find _x);
			_x call _markerDeleted;
		}
	} forEach cntr_previousMapMarkers;
}
