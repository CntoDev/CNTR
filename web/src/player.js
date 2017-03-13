import { STATE_CACHING_FREQUENCY } from './constants.js';

import { applyEvent } from './events.js';

export function createPlayer(frames, state) {
  let stateCache = [];
  let currentFrameIndex = -1;

  return {
    reset,
    playNextFrame,
    goToFrame,

    get currentFrameIndex() { return currentFrameIndex },
  };

  function reset() {
    stateCache = [];
    currentFrameIndex = -1;
  }

  function playNextFrame() {
    const currentFrame = frames[++currentFrameIndex];

    if (currentFrame) {
      const newState = applyFrameToState(currentFrame);

      if (!(currentFrameIndex % STATE_CACHING_FREQUENCY)) {
        stateCache[currentFrameIndex] = newState;
      }

      return true;
    } else {
      return false;
    }
  }

  function goToFrame(frameIndex) {
    const lastCachedStateIndex = findLastCachedStateIndex(frameIndex);

    restoreCachedState(stateCache[lastCachedStateIndex]);
    currentFrameIndex = lastCachedStateIndex;

    while (currentFrameIndex !== frameIndex) playNextFrame();
  }

  function restoreCachedState(cachedStateIndex) {
    const cachedState = stateCache[cachedStateIndex];

    Object.assign(state, clone(cachedState));
  }

  function clone(object) {
    return JSON.parse(JSON.stringify(object));
  }

  function applyFrameToState(frame) {
    state.events = [];
    frame.forEach(event => applyEvent(state, event));
  }

  function findLastCachedStateIndex(frameIndex) {
    return Number.parseInt(findNearestLowerNumber(frameIndex, Object.keys(stateCache)));
  }

  function findNearestLowerNumber(number, array) {
    let low = 0;
    let high = array.length - 1;

    while (high - low > 1) {
      let mid = Math.floor((low + high) / 2);
      if (array[mid] <= number) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return array[low];
  }
}
