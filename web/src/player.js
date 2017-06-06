import { createEmitter } from './emitter.js'
import { applyEvent } from './events.js'

import { FRAME_PLAYBACK_INTERVAL, DEFAULT_PLAYBACK_SPEED } from './constants.js'

const STATE_CACHING_INTERVAL = 20

export function createPlayer (settings) {
  let frames = null
  let intervalHandle = null
  let currentFrameIndex = 0
  let playbackSpeed = DEFAULT_PLAYBACK_SPEED
  let state = createEmptyState()
  let stateCache = []

  const player = createEmitter({
    load,
    play,
    pause,
    togglePlayback,
    stop,
    goTo,
    reset,

    get state() { return state },
    get playbackSpeed () { return playbackSpeed },
    set playbackSpeed (newPlaybackSpeed) { updatePlaybackSpeed(newPlaybackSpeed) },
    get playing () { return !!intervalHandle },
    get totalFrameCount () { return frames ? frames.length - 1 : null },
    get currentFrame () { return frames ? frames[currentFrameIndex] : null },
    get currentFrameIndex () { return frames ? currentFrameIndex : null },
  })

  return player

  function togglePlayback() {
    if (player.playing) {
      pause()
    } else {
      play()
    }
  }

  function load (newFrames) {
    frames = newFrames
    stateCache = []
    reset()
    emitUpdate()
  }

  function reset () {
    state = createEmptyState()
    currentFrameIndex = -1
    if (frames) {
      applyNextFrame()
    }
  }

  function emitUpdate() {
    player.emit('update', player)
  }

  function updatePlaybackSpeed(newPlaybackSpeed) {
    playbackSpeed = newPlaybackSpeed
    if (intervalHandle) {
      clearInterval(intervalHandle)
      intervalHandle = setInterval(() => requestAnimationFrame(playFrame), FRAME_PLAYBACK_INTERVAL / playbackSpeed)
    }
    emitUpdate()
  }

  function play () {
    if (frames) {
      intervalHandle = setInterval(() => requestAnimationFrame(playFrame), FRAME_PLAYBACK_INTERVAL / playbackSpeed)
      emitUpdate()
    }
  }

  function playFrame () {
    const playing = applyNextFrame()

    if (!playing) {
      player.pause()
    }

    emitUpdate()
  }

  function pause () {
    clearInterval(intervalHandle)
    intervalHandle = 0
    emitUpdate()
  }

  function stop () {
    pause()
    reset()
  }

  function findPreviousCachedIndex(frameIndex) {
    let nearestIndex = Math.floor(frameIndex / STATE_CACHING_INTERVAL) * STATE_CACHING_INTERVAL
    while (!stateCache[nearestIndex]) {
      nearestIndex -= STATE_CACHING_INTERVAL
    }
    return nearestIndex
  }

  function goTo (frameIndex) {
    if (frameIndex < currentFrameIndex) {
      currentFrameIndex = findPreviousCachedIndex(frameIndex)
      state = stateCache[currentFrameIndex]
    }

    while (currentFrameIndex < frameIndex - 1) applyNextFrame(true)

    emitUpdate()

    if (!!intervalHandle) {
      pause()
      play()
    }
  }

  function applyNextFrame (suppressUpdate = false) {
    const currentFrame = frames[currentFrameIndex + 1]

    if (currentFrame) {
      applyFrame(state, currentFrame, currentFrameIndex)
      ++currentFrameIndex

      if (currentFrameIndex % STATE_CACHING_INTERVAL === 0) {
        stateCache[currentFrameIndex] = clone(state)
      }

      if (!suppressUpdate) {
        emitUpdate()
      }

      return true
    } else {
      return false
    }
  }
}

function createEmptyState() {
  return {
    frameIndex: -1,
    entities: [],
    events: [],
    eventLog: [],
  }
}

function clone(object) {
  return JSON.parse(JSON.stringify(object))
}

function applyFrame(state, events, frameIndex) {
  state.events = []
  events.forEach(event => applyEvent(state, event, frameIndex))
  state.frameIndex = frameIndex
}
