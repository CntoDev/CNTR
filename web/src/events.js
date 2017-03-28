import React from 'react'
import moment from 'moment'
import isNumber from 'lodash/isNumber'

import styles from './components/event-log.css'

import { EVENTS } from './constants.js'

import { createUnit, createVehicle } from './entity.js'

export function applyEvent (state, event, frameIndex) {
  const eventId = event[0]

  switch (eventId) {
    case EVENTS.MOVED.ID:
      return applyMoveEvent(state, event)
    case EVENTS.UNIT_SPAWNED.ID:
      return applyUnitSpawnedEvent(state, event)
    case EVENTS.VEHICLE_SPAWNED.ID:
      return applyVehicleSpawnedEvent(state, event)
    case EVENTS.RESPAWNED.ID:
      return applyRespawnedEvent(state, event)
    case EVENTS.DESPAWNED.ID:
      return applyDespawnedEvent(state, event)
    case EVENTS.CONNECTED.ID:
      return applyConnectedEvent(state, event, frameIndex)
    case EVENTS.DISCONNECTED.ID:
      return applyDisconnectedEvent(state, event, frameIndex)
    case EVENTS.FIRED.ID:
      return applyFiredEvent(state, event)
    case EVENTS.HIT.ID:
      return applyHitEvent(state, event, frameIndex)
    case EVENTS.KILLED.ID:
      return applyKilledEvent(state, event, frameIndex)
    case EVENTS.GOT_IN.ID:
      return applyGotInEvent(state, event)
    case EVENTS.GOT_OUT.ID:
      return applyGotOutEvent(state, event)
    default:
      return
  }
}

function applyMoveEvent (state, event) {
  const [, entityId, x, y, dir] = event

  const entityPose = state.entities[entityId].pose
  const newPose = {
    x: isNumber(x) ? x : entityPose.x,
    y: isNumber(y) ? y : entityPose.y,
    dir: isNumber(dir) ? dir : entityPose.dir,
  }
  Object.assign(entityPose, newPose)

  ;(entityPose.crew || []).forEach(unit => Object.assign(unit, newPose))
}

function applyUnitSpawnedEvent (state, event) {
  const unitId = event[1]
  const vehicleId = event[11]

  const oldMarker = state.entities[unitId] && state.entities[unitId].marker

  const unit = state.entities[unitId] = createUnit(event)

  if (isNumber(vehicleId)) {
    const unit = state.entities[unitId]
    const vehicle = state.entities[vehicleId]
    vehicle.addCrewMember(unit)
  }

  unit.marker = oldMarker
}

function applyVehicleSpawnedEvent (state, event) {
  const vehicleId = event[1]

  const oldMarker = state.entities[vehicleId] && state.entities[vehicleId].marker

  const vehicle = state.entities[vehicleId] = createVehicle(event)

  vehicle.marker = oldMarker
}

function applyRespawnedEvent (state, event) {
  const entityId = event[1]
  state.entities[entityId].alive = true
}

function applyDespawnedEvent (state, event) {
  const entityId = event[1]
  state.entities[entityId].alive = false
  state.entities[entityId].visible = false
}

function applyConnectedEvent (state, event, frameIndex) {
  addLoggedEvent(state, <ConnectedLog frameIndex={frameIndex} player={state.entities[event[1]]}/>)
}

function applyDisconnectedEvent (state, event, frameIndex) {
  addLoggedEvent(state, <DisconnectedLog frameIndex={frameIndex} player={state.entities[event[1]]}/>)
}

function applyHitEvent (state, event, frameIndex) {
  if (isNumber(event[1]) && isNumber(event[2])) {
    addBattleEvent(state, event)
    //addLoggedEvent(state, <HitLog victim={state.entities[event[1]]} shooter={state.entities[event[2]]}/>)
  }
}

function applyFiredEvent (state, event) {
  if (isNumber(event[1]) && isNumber(event[2]) && isNumber(event[3])) {
    addBattleEvent(state, event)
  }
}

function applyKilledEvent (state, event, frameIndex) {
  const victimId = event[1]
  state.entities[victimId].alive = false
  addBattleEvent(state, event)
  addLoggedEvent(state, <KilledLog frameIndex={frameIndex} victim={state.entities[event[1]]}
                                   shooter={state.entities[event[2]]}/>)
}

function applyGotInEvent (state, [, unitId, vehicleId]) {
  const unit = state.entities[unitId]
  const vehicle = state.entities[vehicleId]
  vehicle.addCrewMember(unit)
}

function applyGotOutEvent (state, [, entityId]) {
  const unit = state.entities[entityId]
  unit.vehicle.removeCrewMember(unit)
}

function addLoggedEvent (state, event) {
  state.eventLog.push(event)
}

function addBattleEvent (state, event) {
  state.events.push(event)
}

function KilledLog ({shooter, victim, frameIndex}) {
  return shooter ?
    <li className={styles.event}>
      <span className={styles[victim.side]}>{victim.name || victim.description}</span> was killed by <span
      className={styles[shooter.side]}>{shooter.name}</span><br />
      <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
    </li> :
    <li className={styles.event}>
      <span className={styles[victim.side]}>{victim.name || victim.description}</span> was killed<br />
      <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
    </li>
}

function HitLog ({shooter, victim, frameIndex}) {
  return <li className={styles.event}>
    <span className={styles[victim.side]}>{victim.name || victim.description}</span> was hit by <span
    className={styles[shooter.side]}>{shooter.name}</span><br />
    <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
  </li>
}

function ConnectedLog ({player, frameIndex}) {
  return <li className={styles.event}>
    <span className={styles[player.side]}>{player.name}</span> connected.<br />
    <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
  </li>
}

function DisconnectedLog ({player, frameIndex}) {
  return <li className={styles.event}><span className={styles[player.side]}>{player.name}</span> disconnected.<br />
    <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
  </li>
}
