import 'leaflet'
import Leaflet from 'leaflet'
import './entity-symbol'

import { MAP_DIRECTORY, MAP_DEFAULTS, MAP_MAX_NATIVE_ZOOM, MAP_MIN_ZOOM, TILE_LAYER_DEFAULTS, SIDE_CLASSES } from '../constants.js'

export function createMapController (mapElement, state, initialSettings) {

  console.log(Leaflet)

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

  function updateSettings(newSettings) {
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
      if (state.followedUnit) {
        markers[state.followedUnit.id].hidePopup()
        state.follow(null)
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

    state.on('update', update)
    state.on('reset', reset)
  }

  function reset () {
    Object.values(markers).forEach(marker => {
      marker.used = false
      marker.setClasses({unused: true})
    })
  }

  function update (state) {
    if (skipUpdate) return

    state.entities.forEach(renderEntity)

    Object.values(markers).forEach(marker => {
      if (!marker.used) {
        marker.setClasses({unused: true})
      }
    })

    lines.forEach(line => map.removeLayer(line))
    lines = []
    state.events.forEach(event => renderEvent(event, state))

    Object.values(markers).forEach(marker => {
      if (!marker.used) {
        marker.setClasses({unused: true})
        marker.hidePopup()
      }
    })

    if (state.followedUnit) {
      const pose = state.followedUnit.pose
      if (pose !== null) {
        map.setView(coordinatesToLatLng(pose), map.getZoom())
      } else {

      }
    }
  }

  function getMarker ({id}) {
    return markers[id]
  }

  function createMarker (entity) {
    const marker = L.marker([-1000000, -1000000]).addTo(map)

    marker.id = markerId++

    marker.setIcon(L.svgIcon({
      iconSize: entity.crew ? [32, 32] : [24, 24],
      iconUrl: `images/markers/${entity.type.toLowerCase()}.svg#symbol`,
      classList: ['marker']
    }))

    marker.bindPopup(createPopup(entity))
    marker.on('click', () => {
      if (state.followedUnit) {
        markers[state.followedUnit.id].hidePopup()
      }
      state.follow(entity)
      marker.showPopup()
    })
    marker.on('mouseover', () => {
      if (state.followedUnit !== entity && !entity.vehicle && settings.labels.mouseOver) {
        marker.showPopup()
        marker.popupOnMouse = true
      }
    })
    marker.on('mouseout', () => {
      if (state.followedUnit !== entity && !entity.vehicle && marker.popupOnMouse) {
        marker.hidePopup()
        marker.popupOnMouse = false
      }
    })

    markers[entity.id] = marker

    marker.move = function ({x, y, dir}) {
      if (x !== marker.lastX || y !== marker.lastY) {
        marker.setLatLng(coordinatesToLatLng({x, y}))
      }

      if (dir !== marker.lastDir) {
        marker.setRotationAngle(dir)
      }

      marker.lastX = x
      marker.lastY = y
      marker.lastDir = dir
    }

    marker.hide = function () {
      marker.setClasses({hidden: true})
      marker.hidePopup()
    }

    marker.showPopup = function () {
      if (!marker.popupOpen) {
        marker._popup._contentNode.style.display = 'block'
        marker.popupOpen = true;
      }
    }

    marker.hidePopup = function () {
      if (marker.popupOpen) {
        marker._popup._contentNode.style.display = 'none'
        marker.popupOpen = false
      }
    }

    marker.openPopup()
    marker.popupOpen = true
    marker.hidePopup()
    marker.getPopup().setContent(entity.name)

    return marker
  }

  function renderEntity (entity) {
    const marker = getMarker(entity) || createMarker(entity)
    marker.used = true

    const hidden = !!entity.vehicle || (!settings.showCurators && entity.isCurator)
    const dead = !entity.alive

    if (hidden) {
      marker.setClasses({hidden})
      marker.hidePopup()
    } else {
      if (!(dead && marker.renderedDead)) {

        marker.move(entity.pose)
        marker.setClasses({
          ...SIDE_CLASSES,
          [entity.side]: true,
          ['cntr-id--' + entity.id]: true,
          followed: (entity.crew || [entity]).includes(state.followedUnit),
          dead,
          hidden,
          hit: false,
          killed: false,
          unused: false,
        })
        renderPopup(marker, entity)

        marker.renderedDead = dead
      } else {
        marker.setClasses({unused: false})
      }
    }
  }

  function renderPopup (marker, entity) {
    if (entity.crew && marker.popupOpen) {
      const label = [`${entity.name} (${entity.crew.length})`, ...entity.crew.map(unit => unit.name)].join('<br>')
      if (label !== marker.label) {
        marker.getPopup().setContent(label)
        marker.label = label
      }
    }

    if (shouldOpenPopup(entity)) {
      marker.showPopup()
    } else {
      marker.hidePopup()
    }
  }

  function shouldOpenPopup (entity) {
    if (!entity.alive) {
      return false
    }

    let popupOpen = false

    if (entity.isPlayer && settings.labels.players) {
      popupOpen = !entity.vehicle
    } else if (entity.type === 'Man' && settings.labels.ai) {
      popupOpen = !entity.vehicle
    } else if (entity.crew && settings.labels.vehicles) {
      if (settings.labels.players && entity.crew.some(unit => unit.isPlayer)) {
        popupOpen = true
      }
      if (settings.labels.ai && !entity.crew.some(unit => unit.isPlayer)) {
        popupOpen = true
      }
    }

    return popupOpen
  }

  function createPopup (entity) {
    const popup = L.popup({
      autoPan: false,
      autoClose: false,
      closeButton: false,
      className: entity.crew ? 'leaflet-popup-vehicle' : 'leaflet-popup-unit',
    })
    popup.setContent(entity.name)
    return popup
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
        [target.side]: true,
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
          [target.side]: true,
          killed: true,
          hit: false,
        })
      }

    } else if (event[0] === 'F') {
      const shooter = state.entities[event[1]]

      line = L.polyline(
        [coordinatesToLatLng(shooter.pose), coordinatesToLatLng({x: event[2], y: event[3]})],
        {className: 'hitLine ' + shooter.side})
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
