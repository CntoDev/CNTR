private _player = _this;

private _addPlayerActions = {
  _player addAction ["Start capture", {
    if (not cntr_captureRunning) then {
      [] call cntr_fnc_startCapture;
    };
  }];
  _player addAction ["Stop capture", {
    if (cntr_captureRunning) then {
      [] call cntr_fnc_stopCapture;
    };
  }];
};

_player addEventHandler ["Respawn", _addPlayerActions];
[] call _addPlayerActions;

"Debug enabled!" call cntr_fnc_logDebug;
