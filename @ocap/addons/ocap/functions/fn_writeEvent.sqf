#define OCAP_BUFFER_SIZE 8192
#define NEWLINE toString[10]

private _event = _this;

if (ocap_captureRunning) then {
  _event call ocap_fnc_logDebug;

  if (ocap_lastWrittenFrameIndex != ocap_currentFrameIndex) then {
    ocap_writeBuffer = ocap_writeBuffer + NEWLINE;
    ocap_lastWrittenFrameIndex = ocap_currentFrameIndex;
  };

  ocap_writeBuffer = ocap_writeBuffer + (_event joinString ",") + ";";

  if (count ocap_writeBuffer > OCAP_BUFFER_SIZE) then {
    [] call ocap_fnc_flushWriteBuffer;
  };
};
