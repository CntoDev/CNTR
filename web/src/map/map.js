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

  let mapMarkers = {}
  let icons = {}
  let lines = []
  let uiState = initialUiState

  let map = null
  let popupLayer = null
  let markerLayer = null
  let mapMultiplier
  let mapImageSize
  let skipUpdate = false

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
      Object.values(icons).forEach(icon => icon.removeFrom(map))
    }
    mapMarkers = {}
    icons = {}
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
        mapController.setUiState({followedUnit: null}, () =>  icons[lastFollowedUnit].hideLabel())
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
    state.mapMarkers.forEach(renderMapMarker)

    lines.forEach(line => map.removeLayer(line))
    lines = []
    state.events.forEach(event => renderEvent(event, state))

    Object.values(icons).forEach(icon => {
      if (!state.entities[icon.id]) {
        icon.hide()
      }
    })

    if (uiState.followedUnit) {
      const pose = state.entities[uiState.followedUnit].pose
      if (pose !== null) {
        map.setView(coordinatesToLatLng(pose), map.getZoom())
      }
    }
  }

  function getIcon ({id}) {  
    return icons[id]
  }

  function getMapMarker ({id}) {
    return mapMarkers[id]
  }

  function getMapMarkerType(mapMarker) {
    const markerPrefix = /^(b|c|hd|mil|n|o|u)/

    if (markerPrefix.test(mapMarker.type)) {
      return mapMarker.type
    } else {
      mapMarker.hidden = true
      return 'unknown'
    }
  }

  function getEntityIconType(entity) {
    if (entity.isVehicle || entity.side !== 'civ') {
      return entity.kind.toLowerCase()
    } else {
      return 'man'
    }
  }

  function createMapMarker (mapMarker) {
    const marker = mapMarkers[mapMarker.id] = L.marker([-1000000, -1000000]).addTo(map)
    marker.id = mapMarker.id

    marker.setIcon(L.svgIcon({
      iconSize: [24, 24],
      iconUrl: `images/mapMarkers/${getMapMarkerType(mapMarker)}.svg#symbol`,
      classList: ['marker'],
    }))

    marker.bindPopup(L.popup({
      maxWidth: 256,
      autoPan: false,
      autoClose: false,
      closeButton: false,
      closeOnClick: false,
    })).openPopup()

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

    marker.showLabel = function () {
        marker._popup._container.style.display = 'block'
    }

    marker.hideLabel = function () {
        marker._popup._container.style.display = 'none'
    }

    marker.setLabel = function (label) {
      if (label !== marker.text) {
        marker.getPopup().setContent(label)
        marker.text = label
      }
    }

    marker.setColor = function (color) {
      marker.getElement().style.fill = color
      marker.getElement().style.stroke = color
    }

    marker.setClasses({
      ['cntr-mapMarkerId--' + mapMarker.id]: true,
    })

    // Visibility of marker labels, as well as markers will be controlled using an upcoming settings menu 
    marker.labelVisible = true
    marker.setLabel(mapMarker.text)
    marker.setColor(mapMarker.markerColor)

    return marker
  }

  function renderMapMarker (mapMarker) {
    const marker = getMapMarker(mapMarker) || createMapMarker(mapMarker)
    const hidden = mapMarker.hidden

    if (state.frameIndex >= mapMarker.frameIndex && !hidden) {
      marker.move(mapMarker.pose)
      marker.show()
    } else {
      marker.hide()
    } 
  }

  function createIcon (entity) {
    const icon = icons[entity.id] = L.marker([-1000000, -1000000]).addTo(map)
    icon.id = entity.id

    icon.setIcon(L.svgIcon({
      iconSize: entity.isVehicle ? [32, 32] : [24, 24],
      iconUrl: `images/markers/${getEntityIconType(entity)}.svg#symbol`,
      classList: ['icon'],
    }))

    icon.bindPopup(L.popup({
      maxWidth: 256,
      autoPan: false,
      autoClose: false,
      closeButton: false,
      closeOnClick: false,
    })).openPopup()

    icon.off('click')

    icon.on('click', () => {
      if (isNumber(uiState.followedUnit) && uiState.followedUnit !== entity.id) {
        getIcon({id: uiState.followedUnit}).hideLabel()
      }

      mapController.setUiState({followedUnit: entity.id}, () => {
        icon.labelVisible = false
        icon.labelOnMouse = false
        icon.showLabel()
      })
    })

    icon.on('mouseover', () => {
      if (uiState.labels.mouseOver && uiState.followedUnit !== entity.id && !isNumber(entity.vehicle) && !icon.labelVisible) {
        icon.labelOnMouse = true
        icon.showLabel()
      }
    })

    icon.on('mouseout', () => {
      if (uiState.followedUnit !== entity.id && !isNumber(entity.vehicle) && icon.labelOnMouse) {
        icon.labelOnMouse = false
        icon.hideLabel()
      }
    })

    icon.showLabel = function () {
      if (!icon.labelVisible) {
        icon._popup._container.style.display = 'block'
        icon.labelVisible = true
      }
    }

    icon.hideLabel = function () {
      if (icon.labelVisible) {
        icon._popup._container.style.display = 'none'
        icon.labelVisible = false
      }
    }

    icon.move = function ({x, y, dir}) {
      if (dir !== icon.lastDir) {
        icon.setRotationAngle(dir)
      }

      if (x !== icon.lastX || y !== icon.lastY) {
        icon.setLatLng(coordinatesToLatLng({x, y}))
      }

      icon.lastX = x
      icon.lastY = y
      icon.lastDir = dir
    }

    icon.show = function () {
      icon.setClasses({hidden: false})
      if (icon.labelVisible) {
        icon.showLabel()
      }
    }

    icon.hide = function () {
      icon.setClasses({hidden: true})
      icon.hideLabel()
    }

    icon.setLabel = function (label) {
      if (label !== icon.label) {
        icon.getPopup().setContent(label)
        icon.label = label
      }
    }

    icon.setClasses({
      ['cntr-id--' + entity.id]: true,
    })

    icon.labelVisible = true
    icon.hideLabel()
    icon.setLabel(entity.name)

    return icon
  }

  function renderEntity (entity) {
    const icon = getIcon(entity) || createIcon(entity)

    const hidden = isNumber(entity.vehicle) || (!uiState.showCurators && entity.isCurator)
    const dead = !entity.alive

    if (hidden) {
      icon.hide()
    } else {
      if (!(dead && icon.renderedDead)) {
        icon.move(entity.pose)
        icon.setClasses({
          ...SIDE_CLASSES,
          [getSide(player.state, entity)]: true,
          followed: (entity.crew || [entity.id]).includes(uiState.followedUnit),
          dead,
          hidden: false,
          hit: false,
          killed: false,
        })
        icon.renderedDead = dead

        renderLabel(icon, entity)
      } else {
        icon.setClasses({
          killed: false,
          hit: false,
        })
      }
    }
  }

  function renderLabel (icon, entity) {
    if (entity.isVehicle && icon.labelVisible) {
      const crewNames = entity.crew.map(crewId => state.entities[crewId].name)
      const label = [`${entity.name} (${entity.crew.length})`, ...crewNames].join('<br>')
      icon.setLabel(label)
    }

    if (shouldShowLabel(entity)) {
      icon.showLabel()
    } else {
      icon.hideLabel()
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

      getIcon(target).setClasses({
        hit: true,
      })

    } else if (event[0] === 'K') {
      const target = state.entities[event[1]]
      const shooter = state.entities[event[2]]

      if (shooter) {
        line = L.polyline(
          [coordinatesToLatLng(shooter.pose), coordinatesToLatLng(target.pose)],
          {className: 'hitLine killed'})

        getIcon(target).setClasses({
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
