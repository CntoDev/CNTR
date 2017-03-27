export const OCAP_FORMAT_VERSION = '^0.2.0'

export const MAP_DIRECTORY = 'maps'
export const MAP_INDEX_URL = `${MAP_DIRECTORY}/index.json`
export const CAPTURE_INDEX_URL = 'data/index.json'

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

export const FRAME_PLAYBACK_INTERVAL = 1000
export const DEFAULT_PLAYBACK_SPEED = 10

export const DEFAULT_SETTINGS = {
  labels: {
    ai: false,
    players: true,
    vehicles: true,
  },
  hideCurators: true,
}
