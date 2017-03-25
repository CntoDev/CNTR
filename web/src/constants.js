export const MAP_INDEX_URL = 'images/maps/index.json'
export const CAPTURE_INDEX_URL = 'data/index.json'

export const STATE_CACHING_FREQUENCY = 60

export const EVENT_SPAWNED = 'S'
export const EVENT_UNIT_SPAWNED = 'U'
export const EVENT_VEHICLE_SPAWNED = 'V'
export const EVENT_RESPAWNED = 'R'
export const EVENT_DESPAWNED = 'X'
export const EVENT_CONNECTED = 'C'
export const EVENT_DISCONNECTED = 'D'
export const EVENT_MOVED = 'M'
export const EVENT_FIRED = 'F'
export const EVENT_HIT = 'H'
export const EVENT_KILLED = 'K'
export const EVENT_GOT_IN = 'I'
export const EVENT_GOT_OUT = 'O'

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

export const OCAP_FORMAT_VERSION = 1.0