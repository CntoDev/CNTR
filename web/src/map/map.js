import 'leaflet'
import isNumber from 'lodash/isNumber'
import './entity-symbol'

import {
  MAP_DIRECTORY,
  MAP_DEFAULTS,
  MAP_MAX_NATIVE_ZOOM,
  MAP_MIN_ZOOM,
  TILE_LAYER_DEFAULTS,
  SIDE_CLASSES
} from '../constants.js'

export function createMapController (mapElement, player, initialUiState) {

  let markers = {}
  let lines = []
  let uiState = initialUiState

  let map = null
  let popupLayer = null
  let markerLayer = null
  let mapMultiplier
  let mapImageSize
  let skipUpdate = false

  // getting custom markers
  let customMarkers
  fetch( 'images/markers//customMarkers.json' )
  .then( res => {
    customMarkers = res.json();
  })
  
  const mapController = {
    loadWorld,
    updateUiState,
    setUiState: () => {},
  }

  return mapController

  function updateUiState (newUiState) {
    uiState = newUiState
    if (!player.playing) {
      update(player)
    }
  }

  function loadWorld ({worldName, imageSize, multiplier}) {
    player.off('update', update)

    const parent = mapElement.parentNode
    const oldMapElement = mapElement
    mapElement = Object.assign(document.createElement('div'), {id: 'map'})
    parent.insertBefore(mapElement, oldMapElement)
    parent.removeChild(oldMapElement)

    if (map) {
      Object.values(markers).forEach(marker => marker.removeFrom(map))
    }

    markers = {}
    lines = []

    map = L.map(mapElement, {
      crs: L.CRS.Simple,
      ...MAP_DEFAULTS,
    }).setView([0, 0], MAP_MAX_NATIVE_ZOOM)

    const mapBounds = new L.LatLngBounds(
      map.unproject([0, imageSize], MAP_MAX_NATIVE_ZOOM),
      map.unproject([imageSize, 0], MAP_MAX_NATIVE_ZOOM)
    )

    map.fitBounds(mapBounds)
    map._zoom = MAP_MAX_NATIVE_ZOOM //FIXME: investigate why this needs to be hardcoded on init!

    L.tileLayer(`${MAP_DIRECTORY}/${worldName}/{z}/{x}/{y}.png`, {
      bounds: mapBounds,
      ...TILE_LAYER_DEFAULTS,
    }).addTo(map)

    map.setView(map.unproject([imageSize / 2, imageSize / 2]), MAP_MIN_ZOOM)

    mapMultiplier = multiplier / 10
    mapImageSize = imageSize

    popupLayer = document.querySelector('#map .leaflet-pane.leaflet-popup-pane')
    markerLayer = document.querySelector('#map .leaflet-pane.leaflet-marker-pane')

    attachListeners()
  }

  function attachListeners () {
    map.on('dragstart', () => {
      if (uiState.followedUnit) {
        const lastFollowedUnit = uiState.followedUnit
        mapController.setUiState({followedUnit: null}, () =>  markers[lastFollowedUnit].hideLabel())
      }
    })
    map.on('zoomstart', () => {
      skipUpdate = true
      popupLayer.classList.add('zooming')
    })
    map.on('zoomend', () => {
      skipUpdate = false
      popupLayer.classList.remove('zooming')
    })
    player.on('update', update)
  }

  function update ({state}) {
    if (skipUpdate) return

    state.entities.forEach(renderEntity)

    lines.forEach(line => map.removeLayer(line))
    lines = []
    state.events.forEach(event => renderEvent(event, state))

    Object.values(markers).forEach(marker => {
      if (!state.entities[marker.id]) {
        marker.hide()
      }
    })

    if (uiState.followedUnit) {
      const pose = state.entities[uiState.followedUnit].pose
      if (pose !== null) {
        map.setView(coordinatesToLatLng(pose), map.getZoom())
      }
    }
  }

  function getMarker ({id}) {
    return markers[id]
  }

  function getEntityMarkerType(entity) {
    for (let index of customMarkers.correlation) {
      if (index.roleDescription.toLowerCase() === entity.kind.toLowerCase()) {
        return index.markerType.toLowerCase()
      } 
    }

    if (entity.isVehicle || entity.side !== 'civ') {
      return entity.kind.toLowerCase()
    } 
    
    return 'man'
  }

  function createMarker (entity) {
    const marker = markers[entity.id] = L.marker([-1000000, -1000000]).addTo(map)

    marker.id = entity.id

    marker.setIcon(L.svgIcon({
      iconSize: entity.isVehicle ? [32, 32] : [24, 24],
      iconUrl: `images/markers/${getEntityMarkerType(entity)}.svg#symbol`,
      classList: ['marker'],
    }))

    marker.bindPopup(L.popup({
      maxWidth: 256,
      autoPan: false,
      autoClose: false,
      closeButton: false,
      closeOnClick: false,
    })).openPopup()

    marker.off('click')

    marker.on('click', () => {
      if (isNumber(uiState.followedUnit) && uiState.followedUnit !== entity.id) {
        getMarker({id: uiState.followedUnit}).hideLabel()
      }

      mapController.setUiState({followedUnit: entity.id}, () => {
        marker.labelVisible = false
        marker.labelOnMouse = false
        marker.showLabel()
      })
    })

    marker.on('mouseover', () => {
      if (uiState.labels.mouseOver && uiState.followedUnit !== entity.id && !isNumber(entity.vehicle) && !marker.labelVisible) {
        marker.labelOnMouse = true
        marker.showLabel()
      }
    })

    marker.on('mouseout', () => {
      if (uiState.followedUnit !== entity.id && !isNumber(entity.vehicle) && marker.labelOnMouse) {
        marker.labelOnMouse = false
        marker.hideLabel()
      }
    })

    marker.showLabel = function () {
      if (!marker.labelVisible) {
        marker._popup._container.style.display = 'block'
        marker.labelVisible = true
      }
    }

    marker.hideLabel = function () {
      if (marker.labelVisible) {
        marker._popup._container.style.display = 'none'
        marker.labelVisible = false
      }
    }

    marker.move = function ({x, y, dir}) {
      if (dir !== marker.lastDir) {
        marker.setRotationAngle(dir)
      }

      if (x !== marker.lastX || y !== marker.lastY) {
        marker.setLatLng(coordinatesToLatLng({x, y}))
      }

      marker.lastX = x
      marker.lastY = y
      marker.lastDir = dir
    }

    marker.show = function () {
      marker.setClasses({hidden: false})
      if (marker.labelVisible) {
        marker.showLabel()
      }
    }

    marker.hide = function () {
      marker.setClasses({hidden: true})
      marker.hideLabel()
    }

    marker.setLabel = function (label) {
      if (label !== marker.label) {
        marker.getPopup().setContent(label)
        marker.label = label
      }
    }

    marker.setClasses({
      ['cntr-id--' + entity.id]: true,
    })

    marker.labelVisible = true
    marker.hideLabel()
    marker.setLabel(entity.name)

    return marker
  }

  function renderEntity (entity) {
    const marker = getMarker(entity) || createMarker(entity)

    const hidden = isNumber(entity.vehicle) || (!uiState.showCurators && entity.isCurator)
    const dead = !entity.alive

    if (hidden) {
      marker.hide()
    } else {
      if (!(dead && marker.renderedDead)) {
        marker.move(entity.pose)
        marker.setClasses({
          ...SIDE_CLASSES,
          [getSide(player.state, entity)]: true,
          followed: (entity.crew || [entity.id]).includes(uiState.followedUnit),
          dead,
          hidden: false,
          hit: false,
          killed: false,
        })
        marker.renderedDead = dead

        renderLabel(marker, entity)
      } else {
        marker.setClasses({
          killed: false,
          hit: false,
        })
      }
    }
  }

  function renderLabel (marker, entity) {
    if (entity.isVehicle && marker.labelVisible) {
      const crewNames = entity.crew.map(crewId => state.entities[crewId].name)
      const label = [`${entity.name} (${entity.crew.length})`, ...crewNames].join('<br>')
      marker.setLabel(label)
    }

    if (shouldShowLabel(entity)) {
      marker.showLabel()
    } else {
      marker.hideLabel()
    }
  }

  function shouldShowLabel (entity) {
    if (entity.mouseOver) return true
    if (entity.id === uiState.followedUnit) return true
    if (!entity.alive) return false
    if (entity.isPlayer && uiState.labels.players) return !isNumber(entity.vehicle)
    if (entity.isUnit && uiState.labels.ai) return !isNumber(entity.vehicle)
    if (entity.isVehicle && uiState.labels.vehicles) {
      if (uiState.labels.players && entity.crew.some(crewId => state.entities[crewId].isPlayer)) return true
      if (uiState.labels.ai && !entity.crew.some(crewId => state.entities[crewId].isPlayer)) return true
    }
    return false
  }

  function renderEvent (event, state) {
    let line

    if (event[0] === 'H') {
      const target = state.entities[event[1]]
      const shooter = state.entities[event[2]]

      line = L.polyline(
        [coordinatesToLatLng(shooter.pose), coordinatesToLatLng(target.pose)],
        {className: 'hitLine hit'})

      getMarker(target).setClasses({
        hit: true,
      })

    } else if (event[0] === 'K') {
      const target = state.entities[event[1]]
      const shooter = state.entities[event[2]]

      if (shooter) {
        line = L.polyline(
          [coordinatesToLatLng(shooter.pose), coordinatesToLatLng(target.pose)],
          {className: 'hitLine killed'})

        getMarker(target).setClasses({
          killed: true,
          hit: false,
        })
      }

    } else if (event[0] === 'F') {
      const shooter = state.entities[event[1]]

      line = L.polyline(
        [coordinatesToLatLng(shooter.pose), coordinatesToLatLng({x: event[2], y: event[3]})],
        {className: 'hitLine ' + getSide(player.state, shooter)})
    } else {

    }

    if (line) {
      line.addTo(map)
      lines.push(line)
    }
  }

  function coordinatesToLatLng ({x, y}) {
    return map.unproject({
      x: (x * mapMultiplier),
      y: (mapImageSize - y * mapMultiplier),
    }, MAP_MAX_NATIVE_ZOOM)
  }

  function getSide(state, entity) {
    return entity.isVehicle && entity.crew[0] ?
      state.entities[entity.crew[0]].side :
      entity.side
  }
}
