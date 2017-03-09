export function createPlaybackWidgetController() {
  return {
  };
}


function setMissionCurTime(f) {
  missionCurDate.setTime(f*frameCaptureDelay);
  this.missionCurTime.textContent = dateToTimeString(missionCurDate);
  this.setFrameSliderVal(f);
  playbackFrame = f;
}

function setMissionEndTime(f) {
  this.missionEndTime.textContent = dateToTimeString(new Date(f*frameCaptureDelay));
  this.setFrameSliderMax(f);
}

function setFrameSliderMax(f) {
  this.frameSlider.max = f;
}

function setFrameSliderVal(f) {
  this.frameSlider.value = f;
}

function showPlaybackSpeedSlider() {
  this.playbackSpeedSlider.style.display = "inherit";
}

function hidePlaybackSpeedSlider() {
  this.playbackSpeedSlider.style.display = "none";
}

function playPause() {
  playbackPaused = !playbackPaused;

  if (playbackPaused) {
    playPauseButton.style.backgroundPosition = "0 0";
  } else {
    playPauseButton.style.backgroundPosition = `-${playPauseButton.offsetWidth}px 0`;
  }
}

// Add keypress event listener
window.addEventListener("keypress", function(event) {
  //console.log(event);

  switch (event.charCode) {
    case 32: // Spacebar
      playPause();
      break;
  };
});
