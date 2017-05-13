import '../../vendor/leaflet.js'
import '../../vendor/leaflet.svgIcon.js'
import '../../vendor/leaflet.rotatedMarker.js'

import { MAP_DIRECTORY, MAP_MAX_NATIVE_ZOOM, MAP_MIN_ZOOM, MAP_MAX_ZOOM } from '../constants.js'

export function createMapController (mapElement, state, settings) {

  let markerId = 0
  let markers = {}
  let lines = []

  let map = null
  let mapMultiplier
  let mapImageSize

  return {
    loadWorld,
  }

  function loadWorld ({worldName, imageSize, multiplier}) {
    state.off('update', update)

    const parent = mapElement.parentNode
    const oldMapElement = mapElement
    mapElement = Object.assign(document.createElement('div'), {id: 'map'})
    parent.insertBefore(mapElement, oldMapElement)
    parent.removeChild(oldMapElement)

    markers = {}
    lines = []

    map = L.map(mapElement, {
      crs: L.CRS.Simple,
      attributionControl: false,
      closePopupOnClick: false,
      fadeAnimation: true,
      scrollWheelZoom: false,
      zoomAnimation: true,
      zoomControl: false,
      zoomDelta: 1,
      zoomSnap: 0.1,
      maxBoundsViscosity: 1.0,
    }).setView([0, 0], MAP_MAX_NATIVE_ZOOM)

    const mapBounds = new L.LatLngBounds(
      map.unproject([0, imageSize], MAP_MAX_NATIVE_ZOOM),
      map.unproject([imageSize, 0], MAP_MAX_NATIVE_ZOOM)
    )

    map.fitBounds(mapBounds)
    map._zoom = 6 //FIXME: investigate why this needs to be hardcoded on init!

    L.tileLayer(`${MAP_DIRECTORY}/${worldName}/{z}/{x}/{y}.png`, {
      maxNativeZoom: MAP_MAX_NATIVE_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      minZoom: MAP_MIN_ZOOM,
      bounds: mapBounds,
      noWrap: true,
      tms: false
    }).addTo(map)

    map.setView(map.unproject([imageSize / 2, imageSize / 2]), MAP_MIN_ZOOM)

    mapMultiplier = multiplier / 10
    mapImageSize = imageSize

    attachListeners(map, mapElement, state)
  }

  function attachListeners (map, mapElement, state) {
    map.on('dragstart', () => state.follow(null))

    mapElement.addEventListener('wheel', event => {
      const zoom = event.deltaY > 0 ? -0.5 : 0.5
      map.zoomIn(zoom, {animate: false})
    })

    state.on('update', update)
    state.on('reset', reset)
  }

  function update (state) {
    state.entities.forEach(renderEntity)

    lines.forEach(line => map.removeLayer(line))
    lines = []
    state.events.forEach(event => renderEvent(event, state))

    Object.values(markers).forEach(marker => !marker.used && marker.setClasses({unused: true}))

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
      iconSize: entity.type === 'Man' ? [16, 16] : [32, 32],
      iconUrl: `images/markers/${entity.type}.svg#symbol`,
      classList: ['marker']
    }))

    marker.bindPopup(createPopup(entity))
    marker.on('click', () => {
      if (state.followedUnit) {
        markers[state.followedUnit.id].closePopup()
      }
      state.follow(entity)
      marker.openPopup()
    })
    marker.on('mouseover', () => {
      if (state.followedUnit !== entity && !entity.vehicle && settings.labels.mouseOver) {
        !marker.popupOpen && marker.openPopup()
        marker.popupOnMouse = true
      }
    })
    marker.on('mouseout', () => {
      if (state.followedUnit !== entity && !entity.vehicle && marker.popupOnMouse) {
        !marker.popupOpen && marker.closePopup()
        marker.popupOnMouse = false
      }
    })

    markers[entity.id] = marker

    marker.move = function ({x, y, dir}) {
      marker.setLatLng(coordinatesToLatLng({x, y}))
      marker.setRotationAngle(dir)
    }

    marker.hide = function () {
      marker.setClasses({hidden: true})
      marker.closePopup()
    }

    return marker
  }

  function renderEntity (entity) {
    const marker = getMarker(entity) || createMarker(entity)

    marker.used = true
    marker.move(entity.pose)
    marker.setClasses({
      ['cntr-id--' + entity.id]: true,
      [entity.side]: true,
      followed: (entity.crew || [entity]).includes(state.followedUnit),
      dead: !entity.alive,
      hidden: !!entity.vehicle,
      hit: false,
      killed: false,
      unused: false,
    })

    renderPopup(marker, entity)
  }

  function renderPopup (marker, entity) {
    let popupOpen = false

    if (entity.isPlayer && settings.labels.players) {
      popupOpen = !entity.vehicle
    } else if (entity.type === 'Man' && settings.labels.ai) {
      popupOpen = true
    } else if (entity.crew && entity.crew.some(unit => unit.isPlayer) && settings.labels.vehicles && settings.labels.players) {
      popupOpen = true

      marker.getPopup().setContent(`${entity.name} (${entity.crew.length})<br>` +
        entity.crew.map(unit => unit.name).join('<br>'))
    } else if (entity.crew && entity.crew.some(unit => !unit.isPlayer) && settings.labels.vehicles && settings.labels.ai) {
      popupOpen = true
    }

    if (!entity.alive) {
      popupOpen = false
    }

    if (popupOpen) {
      !marker.popupOpen && marker.openPopup()
      marker.popupOpen = true
    } else {
      marker.popupOpen && marker.closePopup()
      marker.popupOpen = false
    }
  }

  function createPopup (entity) {
    const popup = L.popup({
      autoPan: false,
      autoClose: false,
      closeButton: false,
      className: entity.type === 'Man' ? 'leaflet-popup-unit' : 'leaflet-popup-vehicle',
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

  function reset () {
    Object.values(markers).forEach(marker => marker.used = false)
  }

  function coordinatesToLatLng ({x, y}) {
    return map.unproject({
      x: (x * mapMultiplier),
      y: (mapImageSize - y * mapMultiplier),
    }, MAP_MAX_NATIVE_ZOOM)
  }
}
