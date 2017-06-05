import { createEmitter } from './emitter.js'
import { applyEvent } from './events.js'

import { FRAME_PLAYBACK_INTERVAL, DEFAULT_PLAYBACK_SPEED } from './constants.js'

export function createPlayer (state, settings) {
  let frames = null
  let intervalHandle = null
  let currentFrameIndex = 0
  let playbackSpeed = DEFAULT_PLAYBACK_SPEED

  const player = createEmitter({
    load,
    play,
    pause,
    togglePlayback,
    stop,
    goTo,
    reset,

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
    reset()
    emitUpdate()
  }

  function reset () {
    state.eventLog = []
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

  function goTo (frameIndex) {
    currentFrameIndex = -1
    state.reset()
    while (currentFrameIndex < frameIndex - 1) applyNextFrame(true)
    applyNextFrame()

    emitUpdate()

    if (!!intervalHandle) {
      pause()
      play()
    }
  }

  function applyNextFrame (suppressUpdate = false) {

    const currentFrame = frames[currentFrameIndex + 1]

    if (currentFrame) {
      applyFrameToState(currentFrame, suppressUpdate)
      ++currentFrameIndex
      return true
    } else {
      return false
    }
  }

  function applyFrameToState (frame, suppressUpdate) {
    state.events = []
    frame.forEach(event => applyEvent(state, event, currentFrameIndex))
    if (!suppressUpdate) {
      state.update({})
    }
  }
}
