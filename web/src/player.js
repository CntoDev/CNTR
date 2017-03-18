import { STATE_CACHING_FREQUENCY, FRAME_PLAYBACK_INTERVAL, DEFAULT_PLAYBACK_SPEED } from './constants.js';
import { createEmitter } from './emitter.js';
import { applyEvent } from './events.js';

export function createPlayer(frames, state, map, unitList) {
  let intervalHandle = null;
  let currentFrameIndex = -1;

  const player = createEmitter({
    play,
    pause,
    stop,
    goTo,

    playbackSpeed: DEFAULT_PLAYBACK_SPEED,
    get totalFrameCount() { return frames.length },
    get currentFrame() { return frames[currentFrameIndex] },
    get currentFrameIndex() { return currentFrameIndex },
  });
  
  return player;



  function play() {
    intervalHandle = setInterval(playFrame, FRAME_PLAYBACK_INTERVAL / player.playbackSpeed);
    player.emit('started');
  }

  function playFrame() {
    const playing = applyNextFrame();

    player.emit('nextFrame', player.currentFrame, player.currentFrameIndex, player.totalFrameCount);
    map.update(state);
    unitList.update(state);

    if (!playing) {
      player.pause();
    }
  }

  function pause() {
    clearInterval(intervalHandle);

    player.emit('paused');
  }

  function stop() {
    pause();
    reset();

    player.emit('stopped');
  }

  function goTo(frameIndex) {
    currentFrameIndex = -1;
    while (currentFrameIndex !== frameIndex) applyNextFrame();
    map.update(state);
    unitList.update(state);
  }

  function reset() {
    currentFrameIndex = -1;
    applyNextFrame();
    map.update(state);
    unitList.update(state);
  }

  function applyNextFrame() {
    const currentFrame = frames[++currentFrameIndex];

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
  }

}
