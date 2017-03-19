import { createEmitter } from './emitter.js';

export function createState(settings) {

  const state = createEmitter({
    entities: [],
    events: [],
    eventLog: [],
    followedUnit: null,

    update,
    reset,
    follow,
  });

  return state;

  function update(newState) {
    //TODO: complete this!
    state.emit('update', state);
  }

  function reset() {
    state.entities = [];
    state.events = [];
    state.eventLog = [];
    state.emit('update', state);
  }

  function follow(unit) {
    if (state.followedUnit) {
      state.followedUnit.followed = false;
    }
    state.followedUnit = unit;
    if (state.followedUnit) {
      state.followedUnit.followed = true;
    }
    state.emit('update', state);
  }
}