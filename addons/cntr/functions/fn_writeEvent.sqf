#define NEWLINE toString[10]

private _event = _this;

if (cntr_captureRunning) then {

  private _eventString = (_event joinString ",") + ";";

  if (cntr_lastWrittenFrameIndex != cntr_currentFrameIndex) then {
    _eventString = NEWLINE + _eventString;
    cntr_lastWrittenFrameIndex = cntr_currentFrameIndex;
  };

  "cntr_exporter" callExtension ["append", [_eventString]];

  if (cntr_debugLogEvents) then { _eventString call cntr_fnc_logDebug; };

};
