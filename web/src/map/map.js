import '../../vendor/leaflet.js'
import '../../vendor/leaflet.svgIcon.js'
import '../../vendor/leaflet.rotatedMarker.js'

import { MAP_MAX_NATIVE_ZOOM, MAP_MIN_ZOOM, MAP_MAX_ZOOM } from '../constants.js'

export function createMapController (mapElement, state, settings) {

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
    }).setView([0, 0], MAP_MAX_NATIVE_ZOOM)


    const mapBounds = new L.LatLngBounds(
      map.unproject([0, imageSize], MAP_MAX_NATIVE_ZOOM),
      map.unproject([imageSize, 0], MAP_MAX_NATIVE_ZOOM)
    )

    map.fitBounds(mapBounds)

    L.tileLayer('images/maps/' + worldName + '/{z}/{x}/{y}.png', {
      maxNativeZoom: MAP_MAX_NATIVE_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      minZoom: MAP_MIN_ZOOM,
      bounds: mapBounds,
      noWrap: true,
      tms: false
    }).addTo(map)

    map.setView(map.unproject([imageSize / 2, imageSize / 2]), MAP_MIN_ZOOM)

    let drawing = false

    window.addEventListener('keydown', function (e) {
      if (e.ctrlKey) {
        map.dragging.disable()
        drawing = true
      } else {
        map.dragging.enable()
        drawing = false
      }
    })

    window.addEventListener('keyup', function (e) {
      if (e.ctrlKey) {
        map.dragging.disable()
        drawing = true
      } else {
        map.dragging.enable()
        drawing = false
      }
    })

    let line

    map.on('mousedown', function (e) {
      if (drawing) {
        const thisLine = line = L.polyline([e.latlng], {className: 'testLine'})
        thisLine.on('click', () => thisLine.removeFrom(map))
        thisLine.addTo(map)
      }
    })


    map.on('mousemove', function (e) {
      if (drawing && line) {
        line.addLatLng(e.latlng)
      }
    })

    map.on('mouseup', function (e) {
      if (drawing) {
        line = null
      }
    })

    map.on('dragstart', () => state.follow(null))

    mapElement.addEventListener('wheel', event => {
      const zoom = event.deltaY > 0 ? -0.5 : 0.5
      map.zoomIn(zoom, {animate: false})
    })

    mapMultiplier = multiplier / 10
    mapImageSize = imageSize

    state.on('update', update)
  }

  function update (state) {
    state.entities.forEach(renderEntity)
    lines.forEach(line => map.removeLayer(line))
    lines = []
    state.events.forEach(event => renderEvent(event, state))

    if (state.followedUnit) {
      const pose = state.followedUnit.pose
      if (pose !== null) {
        map.setView(coordinatesToLatLng(pose), map.getZoom())
      } else {

      }
    }
  }

  function renderEntity (entity) {
    const marker = getMarker(entity) || createMarker(entity)

    marker.setLatLng(coordinatesToLatLng(entity.pose))
    marker.setRotationAngle(entity.pose.dir)

    marker.setClasses({
      [entity.side]: true,
      followed: (entity.crew || [entity]).includes(state.followedUnit),
      alive: entity.alive,
      dead: !entity.alive,
      hit: false,
      killed: false,
      inVehicle: !!entity.vehicle,
    })

    renderPopup(marker, entity)
  }

  function renderPopup (marker, entity) {
    marker.closePopup()

    if (entity.isPlayer && !entity.vehicle && settings.labels.players) {
      marker.openPopup()
    } else if (entity.kind === 'Man' && settings.labels.ai) {
      marker.openPopup()
    } else if (entity.crew && entity.crew.some(unit => unit.isPlayer) && settings.labels.vehicles && settings.labels.players) {
      marker.openPopup()

      marker.getPopup().setContent(entity.description + ' (' + entity.crew.length + ')<br>' +
        entity.crew.map(unit => unit.name).join('<br>'))
    } else if (entity.crew && entity.crew.some(unit => !unit.isPlayer) && settings.labels.vehicles && settings.labels.ai) {
      marker.openPopup()
    }
  }

  function createMarker (entity) {
    const marker = L.marker([-1000000, -1000000]).addTo(map)

    marker.setIcon(L.svgIcon({
      iconSize: entity.kind === 'Man' ? [16, 16] : [32, 32],
      iconUrl: `images/markers/${entity.kind}.svg#symbol`,
      classList: ['marker']
    }))

    marker.bindPopup(createPopup(entity))
    marker.on('click', () => {
      state.follow(entity)
    })

    markers[entity.id] = marker

    return marker
  }

  function createPopup (entity) {
    let popup = L.popup({
      autoPan: false,
      autoClose: false,
      closeButton: false,
      className: entity.kind === 'Man' ? 'leaflet-popup-unit' : 'leaflet-popup-vehicle',
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

      line = L.polyline(
        [coordinatesToLatLng(shooter.pose), coordinatesToLatLng(target.pose)],
        {className: 'hitLine killed'})

      getMarker(target).setClasses({
        [target.side]: true,
        killed: true,
        hit: false,
      })

    } else if (event[0] === 'F') {
      const shooter = state.entities[event[1]]

      line = L.polyline(
        [coordinatesToLatLng(shooter.pose), coordinatesToLatLng({x: event[2], y: event[3]})],
        {className: 'hitLine fired'})
    }

    line.addTo(map)
    lines.push(line)
  }

  function getMarker ({id}) {
    return markers[id]
  }

  function coordinatesToLatLng ({x, y}) {
    return map.unproject({
      x: (x * mapMultiplier),
      y: (mapImageSize - y * mapMultiplier),
    }, MAP_MAX_NATIVE_ZOOM)
  }
}
