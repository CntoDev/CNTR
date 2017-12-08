private _player = _this;

private _addPlayerActions = {
  _player addAction ["Start capture", cntr_fnc_startCapture];
  _player addAction ["Stop capture", cntr_fnc_stopCapture];
};

_player addEventHandler ["Respawn", _addPlayerActions];
[] call _addPlayerActions;

"Debug enabled!" call cntr_fnc_logDebug;
