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

    currentTimeDisplay.innerText = moment.utc(playbackControl.currentFrameIndex * 1000).format("HH:mm:ss");
    endTimeDisplay.innerText = moment.utc(playbackControl.totalFrameCount * 1000).format("HH:mm:ss");
    playbackSlider.value = playbackControl.currentFrameIndex;
    playbackSlider.max = playbackControl.totalFrameCount;
  }

  function updateTime(frame, current, total) {
    currentTimeDisplay.innerText = moment.utc(current * 1000).format("HH:mm:ss");
    endTimeDisplay.innerText = moment.utc(total * 1000).format("HH:mm:ss");
    playbackSlider.value = current;

    if (current === total) {
      playbackRunning = !playbackRunning;
      playPauseButton.classList.toggle('paused');
    }
  }

  function handleKeyboardInput(event) {
    console.log(event);
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
