import {
  STATE_CACHING_FREQUENCY,
  EVENT_SPAWNED, EVENT_RESPAWNED, EVENT_DESPAWNED,
  EVENT_CONNECTED, EVENT_DISCONNECTED,
  EVENT_MOVED,
  EVENT_FIRED, EVENT_HIT, EVENT_KILLED,
  EVENT_GOT_IN, EVENT_GOT_OUT
} from './constants.js';

import { createEntity } from './entity.js';

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
      const newState = applyFrameToState(frames[++currentFrameIndex]);

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

  function applyEvent(state, event) {
    switch(event[0]) {
      case EVENT_MOVED:        return applyMoveEvent(state, event);
      case EVENT_SPAWNED:      return applySpawnedEvent(state, event);
      case EVENT_RESPAWNED:    return applyRespawnedEvent(state, event);
      case EVENT_DESPAWNED:    return applyDespawnedEvent(state, event);
      case EVENT_CONNECTED:    return applyConnectedEvent(state, event);
      case EVENT_DISCONNECTED: return applyDisconnectedEvent(state, event);
      case EVENT_FIRED:        return applyFiredEvent(state, event);
      case EVENT_HIT:          return applyHitEvent(state, event);
      case EVENT_KILLED:       return applyKilledEvent(state, event);
      case EVENT_GOT_IN:       return applyGotInEvent(state, event);
      case EVENT_GOT_OUT:      return applyGotOutEvent(state, event);
      default: return;
    }
  }

  function applyMoveEvent(state, event) {
    const [,entityId,long,lat,dir] = event;
    const entityPose = state.entities[entityId].pose;
    const newPose = {
      long: long || entityPose.long,
      lat: lat || entityPose.lat,
      dir: dir || entityPose.dir,
    };
    return Object.assign(entityPose, newPose);
  }

  function applySpawnedEvent(state, event) {
    const entity = createEntity(event);
    state.entities[entity.id] = entity;
  }

  function applyRespawnedEvent(state, event) {
    const entityId = event[2];
    state.entities[entityId].alive = true;
  }

  function applyDespawnedEvent(state, event) {
    const entityId = event[1];
    state.entities[entityId].alive = false;
    state.entities[entityId].visible = false;
  }

  function applyConnectedEvent(state, event) {
    addEvent(state, event);
  }

  function applyDisconnectedEvent(state, event) {
    addEvent(state, event);
  }

  function applyHitEvent(state, event) {
    addBattleEvent(state, event);
  }

  function applyFiredEvent(state, event) {
    addBattleEvent(state, event);
  }

  function applyKilledEvent(state, event) {
    const entityId = event[2];
    state.entities[entityId].alive = false;
    addBattleEvent(state, event);
    addEvent(state, event);
  }

  function applyGotInEvent(state, [,entityId, vehicleId]) {
    state.entities[entityId].vehicle = state.entities[vehicleId];
  }

  function applyGotOutEvent(state, [,entityId]) {
    state.entities[entityId].vehicle = null;
  }

  function addEvent(state, event) {
    state.events.push(event);
  }

  function addBattleEvent(state, event) {
    state.events.push(event);
  }

}
