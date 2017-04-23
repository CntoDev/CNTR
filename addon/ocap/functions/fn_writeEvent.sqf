#define NEWLINE toString[10]

private _event = _this;

if (ocap_captureRunning) then {

  private _eventString = (_event joinString ",") + ";";

  if (ocap_lastWrittenFrameIndex != ocap_currentFrameIndex) then {
    _eventString = NEWLINE + _eventString;
    ocap_lastWrittenFrameIndex = ocap_currentFrameIndex;
  };

  ["append", _eventString] call ocap_fnc_export;

  if (ocap_debugLogEvents) then { _eventString call ocap_fnc_logDebug; };

};
