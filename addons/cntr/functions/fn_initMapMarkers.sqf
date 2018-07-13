/*
	Author: BananaPeel

	Description:
	Write what the code does
*/
#define CNTR_EVENT_MARKER_SPAWNED "Z"

private _initMapMarkers = { params ["_marker"];

	cntr_previousMapMarkers pushBack _marker;
	cntr_nextMarkerId = cntr_nextMarkerId + 1;

	missionNameSpace setVariable [(_marker + "cntr_marker_id"), cntr_nextMarkerId];

	private _position = markerPos _marker;
	private _pose = [
		(_position select 0) call cntr_fnc_round,
		(_position select 1) call cntr_fnc_round,
		round (markerDir _marker)
	];

	missionNameSpace setVariable [(_marker + "cntr_previousMarkerPose"), _pose];

	[
		CNTR_EVENT_MARKER_SPAWNED, 
		cntr_nextMarkerId, 
		markerType _marker, 
		markerText _marker,
		markerColor _marker,
		_pose select 0,
		_pose select 1,
		_pose select 2
	] call cntr_fnc_writeEvent;
};


private _marker = _this;
if (not isNil {missionNameSpace getVariable (_marker + "cntr_marker_id")}) exitWith {};

[ _marker ] call _initMapMarkers;


