import 'leaflet'
import Leaflet from 'leaflet'
import './entity-symbol'

import {
  MAP_DIRECTORY,
  MAP_DEFAULTS,
  MAP_MAX_NATIVE_ZOOM,
  MAP_MIN_ZOOM,
  TILE_LAYER_DEFAULTS,
  SIDE_CLASSES
} from '../constants.js'

export function createMapController (mapElement, state, initialSettings) {

  let markerId = 0
  let markers = {}
  let lines = []
  let settings = initialSettings

  let map = null
  let popupLayer = null
  let markerLayer = null
  let mapMultiplier
  let mapImageSize
  let skipUpdate = false

  return {
    loadWorld,
    updateSettings,
  }

  function updateSettings (newSettings) {
    settings = newSettings
  }

  function loadWorld ({worldName, imageSize, multiplier}) {
    state.off('update', update)

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
    map._zoom = 6 //FIXME: investigate why this needs to be hardcoded on init!

    L.tileLayer(`${MAP_DIRECTORY}/${worldName}/{z}/{x}/{y}.png`, {
      bounds: mapBounds,
      ...TILE_LAYER_DEFAULTS,
    }).addTo(map)

    map.setView(map.unproject([imageSize / 2, imageSize / 2]), MAP_MIN_ZOOM)

    mapMultiplier = multiplier / 10
    mapImageSize = imageSize

    popupLayer = document.querySelector('#map .leaflet-pane.leaflet-popup-pane')
    markerLayer = document.querySelector('#map .leaflet-pane.leaflet-marker-pane')

    attachListeners(map, state)
  }

  function attachListeners (map, state) {
    map.on('dragstart', () => {
      skipUpdate = true
      if (state.followedUnit) {
        markers[state.followedUnit.id].hideLabel()
        state.follow(null)
      }
    })
    map.on('dragend', () => {
      skipUpdate = false
    })
    map.on('zoomstart', () => {
      skipUpdate = true
      popupLayer.classList.add('zooming')
    })
    map.on('zoomend', () => {
      skipUpdate = false
      popupLayer.classList.remove('zooming')
    })

    state.on('update', update)
    state.on('reset', reset)
  }

  function reset () {
    Object.values(markers).forEach(marker => {
      marker.used = false
      marker.hide()
    })
  }

  function update (state) {
    if (skipUpdate) return

    state.entities.forEach(renderEntity)

    lines.forEach(line => map.removeLayer(line))
    lines = []
    state.events.forEach(event => renderEvent(event, state))

    Object.values(markers).forEach(marker => {
      if (!marker.used) {
        marker.hide()
      }
    })

    if (state.followedUnit) {
      const pose = state.followedUnit.pose
      if (pose !== null) {
        map.setView(coordinatesToLatLng(pose), map.getZoom())
      }
    }
  }

  function getMarker ({id}) {
    const marker = markers[id]
    if (marker) {
      marker.used = true
    }
    return marker
  }

  function createPopup () {
    return L.popup({
      autoPan: false,
      autoClose: false,
      closeButton: false,
    })
  }

  function createMarker (entity) {
    const marker = markers[entity.id] = L.marker([-1000000, -1000000]).addTo(map)

    marker.id = markerId++

    marker.setIcon(L.svgIcon({
      iconSize: entity.isVehicle ? [32, 32] : [24, 24],
      iconUrl: `images/markers/${entity.kind.toLowerCase()}.svg#symbol`,
      classList: ['marker']
    }))

    marker.bindPopup(createPopup()).openPopup()

    marker.on('click', () => {
      if (state.followedUnit) {
        getMarker(state.followedUnit).hideLabel()
      }
      state.follow(entity)
      marker.showLabel()
    })
    marker.on('mouseover', () => {
      entity.mouseOver = true
      if (state.followedUnit !== entity && !entity.vehicle && settings.labels.mouseOver) {
        marker.labelOnMouse = !marker.labelVisible
        marker.showLabel()
      }
    })
    marker.on('mouseout', () => {
      entity.mouseOver = false
      if (state.followedUnit !== entity && !entity.vehicle && marker.labelOnMouse) {
        marker.labelOnMouse = false
        marker.hideLabel()
      }
    })


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
      if (!marker.labelVisible) {
        marker._popup._contentNode.style.visibility = 'inherit'
        marker.labelVisible = true
      }
    }

    marker.hideLabel = function () {
      if (marker.labelVisible) {
        marker._popup._contentNode.style.visibility = 'hidden'
        marker.labelVisible = false
      }
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
    marker.used = true
    marker.setLabel(entity.name)

    return marker
  }

  function renderEntity (entity) {
    const marker = getMarker(entity) || createMarker(entity)

    const hidden = !!entity.vehicle || (!settings.showCurators && entity.isCurator)
    const dead = !entity.alive

    if (hidden) {
      marker.hide()
    } else {
      if (!(dead && marker.renderedDead)) {
        marker.move(entity.pose)
        marker.setClasses({
          ...SIDE_CLASSES,
          [entity.side]: true,
          followed: (entity.crew || [entity]).includes(state.followedUnit),
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
      const label = [`${entity.name} (${entity.crew.length})`, ...entity.crew.map(unit => unit.name)].join('<br>')
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
    if (!entity.alive) return false
    if (entity.isPlayer && settings.labels.players) return !entity.vehicle
    if (entity.isUnit && settings.labels.ai) return !entity.vehicle
    if (entity.isVehicle && settings.labels.vehicles) {
      if (settings.labels.players && entity.crew.some(unit => unit.isPlayer)) return true
      if (settings.labels.ai && !entity.crew.some(unit => unit.isPlayer)) return true
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
        {className: 'hitLine ' + shooter.side})
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
}
