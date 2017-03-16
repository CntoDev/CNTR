private _player = _this;

private _addPlayerActions = {
  _player addAction ["Start capture", {
    if (not ocap_captureRunning) then {
      [] call ocap_fnc_startCapture;
    };
  }];
  _player addAction ["Stop capture", {
    if (ocap_captureRunning) then {
      [] call ocap_fnc_stopCapture;
    };
  }];
};

_player addEventHandler ["Respawn", _addPlayerActions];
[] call _addPlayerActions;

"Debug enabled!" call ocap_fnc_logDebug;
