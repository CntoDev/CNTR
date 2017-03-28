#define OCAP_BUFFER_SIZE 8192
#define NEWLINE toString[10]

private _event = _this;

if (ocap_captureRunning) then {

  private _eventString = ocap_writeBuffer + (_event joinString ",") + ";";

  if (ocap_lastWrittenFrameIndex != ocap_currentFrameIndex) then {
    _eventString = NEWLINE + _eventString;
    ocap_lastWrittenFrameIndex = ocap_currentFrameIndex;
  };

  ["append", _eventString] call ocap_fnc_export;

/*
  //_event call ocap_fnc_logDebug;

  if (ocap_lastWrittenFrameIndex != ocap_currentFrameIndex) then {
    ocap_writeBuffer = ocap_writeBuffer + NEWLINE;
    ocap_lastWrittenFrameIndex = ocap_currentFrameIndex;
  };

  ocap_writeBuffer = ocap_writeBuffer + (_event joinString ",") + ";";

  if (count ocap_writeBuffer > OCAP_BUFFER_SIZE) then {
    private _exportString = ocap_writeBuffer + "";
    ocap_writeBuffer = "";
    ["append", _exportString] spawn ocap_fnc_export;
  };
*/

};
