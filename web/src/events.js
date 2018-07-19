import React from 'react'
import isNumber from 'lodash/isNumber'

import { EVENTS } from './constants.js'

import { createUnit, createVehicle } from './entity.js'
import { createMarker } from './mapMarker.js'

export function applyEvent (state, event, frameIndex) {
  const eventId = event[0]

  switch (eventId) {
    case EVENTS.MARKER_SPAWNED.ID:
      return applyMarkerSpawned (state, event, frameIndex)
    case EVENTS.MARKER_MOVED.ID:
      return applyMarkerMoved (state, event)
    case EVENTS.MARKER_DELETED.ID:
      return applyMarkerDeleted (state, event)
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

//Add event for markers
function applyMarkerSpawned (state, event, frameIndex) {
  const markerId = event[1]
  malformedCheck(markerId, event)
  
  state.mapMarkers[markerId] = createMarker(event, frameIndex)
}

function applyMarkerMoved (state, event) {
  const [ , markerId, x, y, dir] = event
  malformedCheck(markerId, event)

  const marker = state.mapMarkers[markerId]
  const markerPose = marker.pose
  const newPose = {
    x: isNumber(x) ? x : markerPose.x,
    y: isNumber(y) ? y : markerPose.y,
    dir: isNumber(dir) ? dir : markerPose.dir,
  }
  Object.assign(markerPose, newPose)
}

function applyMarkerDeleted (state, event) {
  const markerId = event[1]
  malformedCheck(markerId, event)

  state.mapMarkers[markerId].hidden = true
}

function applyMoveEvent (state, event) {
  const [, entityId, x, y, dir] = event

  if (!isNumber(entityId)) {
    return console.warn('Malformed event: ' + event)
  }

  const entity = state.entities[entityId]
  const entityPose = entity.pose
  const newPose = {
    x: isNumber(x) ? x : entityPose.x,
    y: isNumber(y) ? y : entityPose.y,
    dir: isNumber(dir) ? dir : entityPose.dir,
  }
  Object.assign(entityPose, newPose)

  entity.hidden = false

  if (entity.crew) {
    (entity.crew || []).forEach(crewId => Object.assign(state.entities[crewId].pose, newPose))
  }
}

function applyUnitSpawnedEvent (state, event) {
  const unitId = event[1]
  const vehicleId = event[11]

  const oldMarker = state.entities[unitId] && state.entities[unitId].marker

  const unit = state.entities[unitId] = createUnit(event)
  unit.marker = oldMarker

  if (isNumber(vehicleId)) {
    addToVehicle(state, unitId, vehicleId)
  }
}

function applyVehicleSpawnedEvent (state, event) {
  const vehicleId = event[1]

  const oldMarker = state.entities[vehicleId] && state.entities[vehicleId].marker

  const vehicle = state.entities[vehicleId] = createVehicle(event)
  vehicle.marker = oldMarker
}

function applyRespawnedEvent (state, event) {
  const [, unitId] = event
  if (!isNumber(unitId)) {
    return console.warn('Malformed event: ' + event)
  }

  state.entities[unitId].alive = true
  removeFromVehicle(state, unitId)
}

function applyDespawnedEvent (state, event) {
  const [, unitId] = event
  if (!isNumber(unitId)) {
    return console.warn('Malformed event: ' + event)
  }

  state.entities[unitId].alive = false
  state.entities[unitId].hidden = true
  removeFromVehicle(state, unitId)
}

function applyConnectedEvent (state, event, frameIndex) {
  addLoggedEvent(state, {
    frameIndex,
    type: event[0],
    playerName: event[1],
  })
}

function applyDisconnectedEvent (state, event, frameIndex) {
  addLoggedEvent(state, {
    frameIndex,
    type: event[0],
    playerName: event[1],
  })
}

function applyHitEvent (state, event, frameIndex) {
  if (isNumber(event[1]) && isNumber(event[2])) {
    addBattleEvent(state, event)
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

  removeFromVehicle(state, victimId)

  addBattleEvent(state, event)
  addLoggedEvent(state, {
    frameIndex,
    type: event[0],
    victim: state.entities[event[1]],
    shooter: state.entities[event[2]],
  })
}

function applyGotInEvent (state, event) {
  const [, unitId, vehicleId] = event
  if (!isNumber(unitId) || !isNumber(vehicleId)) {
    return console.warn('Malformed event: ' + event)
  }

  addToVehicle(state, unitId, vehicleId)
}

function applyGotOutEvent (state, event) {
  const [, unitId] = event
  if (!isNumber(unitId)) {
    return console.warn('Malformed event: ' + event)
  }

  removeFromVehicle(state, unitId)
}

function addToVehicle (state, unitId, vehicleId) {
  const unit = state.entities[unitId]

  const vehicle = state.entities[vehicleId]

  if (!vehicle.crew.includes(unitId)) {
    vehicle.crew = [...vehicle.crew, unitId]
    unit.vehicle = vehicleId
  }
}

function removeFromVehicle (state, unitId) {
  const unit = state.entities[unitId]
  const vehicleId = unit.vehicle
  const vehicle = state.entities[vehicleId]

  if (vehicle && vehicle.crew.includes(unitId)) {
    const index = vehicle.crew.indexOf(unitId)
    const newCrew = [...vehicle.crew]
    newCrew.splice(index, 1)
    vehicle.crew = newCrew
    unit.vehicle = null
  }
}

function addLoggedEvent (state, event) {
  state.eventLog.push(event)
}

function addBattleEvent (state, event) {
  state.events.push(event)
}

function malformedCheck (Id, event) {
  if (!isNumber(Id)) {
    return console.warn('Malformed event: ' + event)
  }
}