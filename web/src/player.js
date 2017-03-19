import { createEmitter } from './emitter.js';
import { applyEvent } from './events.js';

import { FRAME_PLAYBACK_INTERVAL, DEFAULT_PLAYBACK_SPEED } from './constants.js';

export function createPlayer(state) {
  let frames = null;
  let intervalHandle = null;
  let currentFrameIndex = -1;

  const player = createEmitter({
    load,
    play,
    pause,
    stop,
    goTo,
    reset,

    playbackSpeed: DEFAULT_PLAYBACK_SPEED,
    get playbackDone() { return currentFrameIndex >= frames.length },
    get totalFrameCount() { return frames && frames.length },
    get currentFrame() { return frames && frames[currentFrameIndex] },
    get currentFrameIndex() { return currentFrameIndex },
  });
  
  return player;



  function load(newFrames) {
    frames = newFrames;
  }

  function play() {
    intervalHandle = setInterval(playFrame, FRAME_PLAYBACK_INTERVAL / player.playbackSpeed);
  }

  function playFrame() {
    const playing = applyNextFrame();

    if (!playing) {
      player.pause();
    }
  }

  function pause() {
    clearInterval(intervalHandle);
  }

  function stop() {
    pause();
    reset();
  }

  function goTo(frameIndex) {
    currentFrameIndex = -1;
    while (currentFrameIndex !== frameIndex) applyNextFrame();
  }

  function reset() {
    currentFrameIndex = -1;
    applyNextFrame();
  }

  function applyNextFrame() {
    const currentFrame = frames[++currentFrameIndex];
    player.emit('nextFrame', player.currentFrame, player.currentFrameIndex, player.totalFrameCount);

    if (currentFrame) {
      applyFrameToState(currentFrame);
      return true;
    } else {
      return false;
    }
  }

  function applyFrameToState(frame) {
    state.events = [];
    frame.forEach(event => applyEvent(state, event));
    state.update({});
  }
}
