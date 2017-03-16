import '../../vendor/leaflet.js';
import '../../vendor/leaflet.svgIcon.js';
import '../../vendor/leaflet.rotatedMarker.js';

import { MAP_MAX_NATIVE_ZOOM, MAP_MIN_ZOOM, MAP_MAX_ZOOM } from '../constants.js';

export function createMapController() {

  const trim = 0;

  let markers = {};
  let lines = [];
  let map = null;
  let mapMultiplier;
  let mapImageSize;

  return {
    initialize,
    update,
  };

  function initialize(mapElement, {worldName, imageSize, multiplier}) {
    map = L.map(mapElement, {
      attributionControl: false,
      closePopupOnClick: false,
      crs: L.CRS.Simple,
      fadeAnimation: true,
      scrollWheelZoom: false,
      zoomAnimation: true,
      zoomControl: false,
      zoomDelta: 1,
      zoomSnap: 0.1,
    }).setView([0, 0], MAP_MAX_NATIVE_ZOOM);

    const mapBounds = new L.LatLngBounds(
        map.unproject([0, imageSize], MAP_MAX_NATIVE_ZOOM),
        map.unproject([imageSize, 0], MAP_MAX_NATIVE_ZOOM)
    );

    map.fitBounds(mapBounds);

    L.tileLayer('images/maps/' + worldName + '/{z}/{x}/{y}.png', {
      maxNativeZoom: MAP_MAX_NATIVE_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
      minZoom: MAP_MIN_ZOOM,
      bounds: mapBounds,
      noWrap: true,
      tms: false
    }).addTo(map);

    map.setView(map.unproject([imageSize / 2, imageSize / 2]), MAP_MIN_ZOOM);

    mapElement.addEventListener("wheel", event => {
      const zoom = event.deltaY > 0 ? -0.5 : 0.5;
      map.zoomIn(zoom, {animate: false});
    });

    mapMultiplier = multiplier / 10;
    mapImageSize = imageSize;
  }

  function update(state) {
    state.entities.forEach(renderEntity);
    lines.forEach(line => map.removeLayer(line));
    lines = [];
    state.events.forEach(event => renderEvent(event, state));
  }


  function renderEntity(entity) {
    const marker = entity.marker = (entity.marker || createMarker(entity));

    marker.setLatLng(coordinatesToLatLng(entity.pose));
    marker.setRotationAngle(entity.pose.dir);

    marker.setClasses({
      west: false,
      east: false,
      ind: false,
      civ: false,
      empty: false,
      [entity.side]: true,
      alive: entity.alive,
      dead: !entity.alive,
      hit: false,
      killed: false,
      isInVehicle: entity.vehicle,
    });
  }

  function createMarker(entity) {
    const marker = L.marker([-1000000, -1000000]).addTo(map);

    marker.setIcon(L.svgIcon({
      iconSize: entity.kind === 'Man' ? [16, 16] : [32, 32],
      iconUrl: `images/markers/${entity.kind}.svg#symbol`,
      classList: ['marker']
    }));

    marker.entity = entity;

    markers[entity.id] = marker;

    return marker;
  }

  function renderEvent(event, state) {
    if (event[0] === 'H') {
      const target = state.entities[event[1]];
      const shooter = state.entities[event[2]];

      const line = L.polyline([coordinatesToLatLng(shooter.pose), coordinatesToLatLng(target.pose)], {
        color: '#f862ff',
        weight: 2,
        opacity: 0.4
      });

      target.marker.setClasses({
        hit: true,
      });

      line.addTo(map);
      lines.push(line);
    } else if (event[0] === 'K') {
      const target = state.entities[event[1]];
      const shooter = state.entities[event[2]];

      const line = L.polyline([coordinatesToLatLng(shooter.pose), coordinatesToLatLng(target.pose)], {
        color: '#ff0000',
        weight: 2,
        opacity: 0.4
      });

      target.marker.setClasses({
        killed: true,
        hit: false,
      });

      line.addTo(map);
      lines.push(line);
    } else if (event[0] === 'F') {
      const shooter = state.entities[event[1]];

      const line = L.polyline([coordinatesToLatLng(shooter.pose), coordinatesToLatLng({x: event[2], y: event[3]})], {
        color: '#000000',
        weight: 2,
        opacity: 0.4
      });
      line.addTo(map);
      lines.push(line);
    }
  }


  function coordinatesToLatLng({x, y}) {
    return map.unproject({
      x: (x * mapMultiplier) + trim,
      y: (mapImageSize - y * mapMultiplier) + trim,
    }, MAP_MAX_NATIVE_ZOOM);
  }

}
/*
// Manage entity at given frame
manageFrame(f) {
  f = this.getRelativeFrameIndex(f);

  if (this.isFrameOutOfBounds(f)) { // Entity does not exist on frame
    this.marker.hide();
  } else { // Entity does exist on frame
    this._updateAtFrame(f);
  };
};

// Get LatLng at specific frame
getLatLngAtFrame(f) {
  var pos = this.getPosAtFrame(f);
  if (pos != null) {return armaToLatLng(pos)};
  return;
};

// Get LatLng at current frame
getLatLng() {
  return this.getLatLngAtFrame(playbackFrame);
};

_createPopup(content) {
  let popup = L.popup({
    autoPan: false,
    autoClose: false,
    closeButton: false,
    className: this._popupClassName
  });
  popup.setContent(content);
  return popup;
};

hideMarkerPopup(bool) {
  let popup = this.marker.getPopup();
  if (popup != null) {
    let element = popup.element;
    let display = "inherit";
    if (bool) {
      display = "none"
    }

    element.style.display = display;
  }
}
*/
