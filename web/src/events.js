import React from 'react';
import moment from 'moment';
import isNumber from 'lodash/isNumber';

import styles from './ui/event-log.css';

import {
  EVENT_SPAWNED, EVENT_RESPAWNED, EVENT_DESPAWNED,
  EVENT_CONNECTED, EVENT_DISCONNECTED,
  EVENT_MOVED,
  EVENT_FIRED, EVENT_HIT, EVENT_KILLED,
  EVENT_GOT_IN, EVENT_GOT_OUT
} from './constants.js';

import { createEntity } from './entity.js';

export function applyEvent(state, event, frameIndex) {
  switch(event[0]) {
    case EVENT_MOVED:        return applyMoveEvent(state, event);
    case EVENT_SPAWNED:      return applySpawnedEvent(state, event);
    case EVENT_RESPAWNED:    return applyRespawnedEvent(state, event);
    case EVENT_DESPAWNED:    return applyDespawnedEvent(state, event);
    case EVENT_CONNECTED:    return applyConnectedEvent(state, event, frameIndex);
    case EVENT_DISCONNECTED: return applyDisconnectedEvent(state, event, frameIndex);
    case EVENT_FIRED:        return applyFiredEvent(state, event);
    case EVENT_HIT:          return applyHitEvent(state, event, frameIndex);
    case EVENT_KILLED:       return applyKilledEvent(state, event, frameIndex);
    case EVENT_GOT_IN:       return applyGotInEvent(state, event);
    case EVENT_GOT_OUT:      return applyGotOutEvent(state, event);
    default: return;
  }
}

function applyMoveEvent(state, event) {
  const [, entityId, x, y, dir] = event;
  const entityPose = state.entities[entityId].pose;
  const newPose = {
    x: isNumber(x) ? x : entityPose.x,
    y: isNumber(y) ? y : entityPose.y,
    dir: isNumber(dir) ? dir : entityPose.dir,
  };
  Object.assign(entityPose, newPose);

  (entityPose.crew || []).forEach(unit => Object.assign(unit, newPose))
}

function applySpawnedEvent(state, event) {
  const oldMarker = state.entities[event[1]] && state.entities[event[1]].marker;

  const entity = createEntity(event);
  state.entities[entity.id] = entity;
  entity.marker = oldMarker;
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

function applyConnectedEvent(state, event, frameIndex) {
  addLoggedEvent(state, <ConnectedLog frameIndex={frameIndex} player={state.entities[event[1]]}/>);
}

function applyDisconnectedEvent(state, event, frameIndex) {
  addLoggedEvent(state, <DisconnectedLog frameIndex={frameIndex} player={state.entities[event[1]]}/>);
}

function applyHitEvent(state, event, frameIndex) {
  if (isNumber(event[1]) && isNumber(event[2])) {
    addBattleEvent(state, event);
    //addLoggedEvent(state, <HitLog victim={state.entities[event[1]]} shooter={state.entities[event[2]]}/>);
  }
}

function applyFiredEvent(state, event) {
  if (isNumber(event[1]) && isNumber(event[2]) && isNumber(event[3])) {
    addBattleEvent(state, event);
  }
}

function applyKilledEvent(state, event, frameIndex) {
  const victimId = event[1];
  state.entities[victimId].alive = false;
  addBattleEvent(state, event);
  addLoggedEvent(state, <KilledLog frameIndex={frameIndex} victim={state.entities[event[1]]} shooter={state.entities[event[2]]}/>);
}

function applyGotInEvent(state, [,unitId, vehicleId]) {
  const unit = state.entities[unitId];
  const vehicle = state.entities[vehicleId];
  vehicle.addCrewMember(unit);
}

function applyGotOutEvent(state, [,entityId]) {
  const unit = state.entities[entityId];
  unit.vehicle.removeCrewMember(unit);
}

function addLoggedEvent(state, event) {
  state.eventLog.push(event);
}

function addBattleEvent(state, event) {
  state.events.push(event);
}


function KilledLog({shooter, victim, frameIndex}) {
  return <li className={styles.event}>
    <span className={styles[victim.side]}>{victim.name || victim.description}</span> was killed by <span className={styles[shooter.side]}>{shooter.name}</span><br />
    <span>{moment.utc(frameIndex * 1000).format("HH:mm:ss")}</span>
  </li>;
}

function HitLog({shooter, victim, frameIndex}) {
  return <li className={styles.event}>
    <span className={styles[victim.side]}>{victim.name || victim.description}</span> was hit by <span className={styles[shooter.side]}>{shooter.name}</span><br />
    <span>{moment.utc(frameIndex * 1000).format("HH:mm:ss")}</span>
  </li>;
}

function ConnectedLog({player, frameIndex}) {
  return <li className={styles.event}>
    <span className={styles[player.side]}>{player.name}</span> connected.<br />
    <span>{moment.utc(frameIndex * 1000).format("HH:mm:ss")}</span>
  </li>;
}

function DisconnectedLog({player, frameIndex}) {
  return <li className={styles.event}><span className={styles[player.side]}>{player.name}</span> disconnected.<br />
    <span>{moment.utc(frameIndex * 1000).format("HH:mm:ss")}</span>
  </li>;
}