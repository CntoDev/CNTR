export const CNTR_FORMAT_VERSION = '0.2.0 || 0.3.0'

export const MAP_DIRECTORY = 'maps'
export const MAP_INDEX_URL = `${MAP_DIRECTORY}/index.json`
export const CAPTURE_INDEX_URL = 'data/index.tsv'

export const EVENTS = {
  UNIT_SPAWNED: { ID: 'U', LENGTH: 12 },
  VEHICLE_SPAWNED: { ID: 'V', LENGTH: 7 },
  RESPAWNED: { ID: 'R', LENGTH: 2 },
  DESPAWNED: { ID: 'X', LENGTH: 2 },
  CONNECTED: { ID: 'C', LENGTH: 2 },
  DISCONNECTED: { ID: 'D', LENGTH: 2 },
  MOVED: { ID: 'M', LENGTH: 5 },
  FIRED: { ID: 'F', LENGTH: 4 },
  HIT: { ID: 'H', LENGTH: 3 },
  KILLED: { ID: 'K', LENGTH: 3 },
  GOT_IN: { ID: 'I', LENGTH: 3 },
  GOT_OUT: { ID: 'O', LENGTH: 3 },
}

export const MAP_MIN_ZOOM = 1
export const MAP_MAX_NATIVE_ZOOM = 6
export const MAP_MAX_ZOOM = MAP_MAX_NATIVE_ZOOM + 3

export const MAP_DEFAULTS = {
  fadeAnimation: false,
  zoomAnimationThreshold: 16,
  markerZoomAnimation: false,
  attributionControl: false,
  closePopupOnClick: false,
  zoomControl: false,
  zoomDelta: 1,
  zoomSnap: 1,
  maxBoundsViscosity: 1.0,
  wheelDebounceTime: 1,
  wheelPxPerZoomLevel: 64,
}

export const TILE_LAYER_DEFAULTS = {
  maxNativeZoom: MAP_MAX_NATIVE_ZOOM,
  maxZoom: MAP_MAX_ZOOM,
  minZoom: MAP_MIN_ZOOM,
  noWrap: true,
  tms: false
}

export const FRAME_PLAYBACK_INTERVAL = 1000
export const DEFAULT_PLAYBACK_SPEED = 10

export const SIDE_CLASSES = {
  hidden: true,
  empty: true,
  west: false,
  east: false,
  guer: false,
  civ: false,
}

export const SIDE_NAMES = {
  west: 'BLUFOR',
  east: 'OPFOR',
  guer: 'INDEPENDENT',
  civ: 'CIVILIAN',
}

export const DEFAULT_STATE = {
  mission: null,
  time: 0,
  labels: {
    mouseOver: true,
    ai: false,
    players: true,
    vehicles: true,
  },
  showCurators: true,
  showFileLines: true,
  followedUnit: null,
  loadCaptureDialogOpen: true,
  loadMapDialogOpen: false,
  infoDialogOpen: false,
  eventLog: [],
  playback: {
    currentFrameIndex: null,
    totalFrameCount: null,
    playing: false,
    playbackSpeed: 10,
  }
}
