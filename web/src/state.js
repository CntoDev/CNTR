import { createEmitter } from './emitter.js';

export function createState() {

  const state = createEmitter({
    entities: [],
    events: [],
    followedUnit: null,
    update,
    reset,
  });

  return state;

  function update(newState) {
    state.emit('update', state);
  }

  function reset() {
    state.entities = [];
    state.events = [];
    state.emit('update', state);
  }
}