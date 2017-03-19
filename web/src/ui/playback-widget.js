import moment from 'moment';

export function createPlaybackWidget(element, playbackControl) {

  const playbackSlider = element.querySelector('#playbackSlider');
  const currentTimeDisplay = element.querySelector('#currentTimeDisplay');
  const endTimeDisplay = element.querySelector('#endTimeDisplay');
  const playPauseButton = element.querySelector('#playPauseButton');

  let playbackRunning = false;

  return Object.assign(element, {
    initialize,
  });

  function initialize() {
    playbackControl.on('nextFrame', updateTime);
    playPauseButton.addEventListener('click', togglePlayback);
    playbackSlider.addEventListener('change', skipToFrame);
    window.addEventListener("keypress", handleKeyboardInput);
  }

  function updateTime(frame, current, total) {
    currentTimeDisplay.innerText = moment.utc(current * 1000).format("HH:mm:ss");
    endTimeDisplay.innerText = moment.utc(total * 1000).format("HH:mm:ss");
    playbackSlider.value = playbackControl.currentFrameIndex;
    playbackSlider.max = playbackControl.totalFrameCount;
    playbackSlider.value = current;

    if (current === total) {
      playbackRunning = !playbackRunning;
      playPauseButton.classList.toggle('paused');
    }
  }

  function handleKeyboardInput(event) {
    switch (event.charCode) {
      case 32: return togglePlayback();
    }
  }

  function skipToFrame() {
    playbackControl.goTo(Number.parseInt(playbackSlider.value));
  }

  function togglePlayback() {
    playbackRunning = !playbackRunning;
    playPauseButton.classList.toggle('paused');

    if (playbackRunning) {
      playbackControl.play();
    } else {
      playbackControl.pause();
    }
  }
}
