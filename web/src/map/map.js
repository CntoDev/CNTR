import '../../vendor/leaflet.js';
import '../../vendor/leaflet.rotatedMarker.js';
import '../../vendor/leaflet.svgIcon.js';

export function createMapController(mapElement) {
  return {
    addEntity,
    clearEntities,
    update,
  };
}
