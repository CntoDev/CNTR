import { createEmitter } from './emitter.js'
import { applyEvent } from './events.js'

import { FRAME_PLAYBACK_INTERVAL, DEFAULT_PLAYBACK_SPEED } from './constants.js'

export function createPlayer (state, settings) {
  let frames = null
  let intervalHandle = null
  let currentFrameIndex = 0

  const player = createEmitter({
    load,
    play,
    pause,
    stop,
    goTo,
    reset,

    playbackSpeed: DEFAULT_PLAYBACK_SPEED,
    get playbackDone () { return currentFrameIndex >= frames.length },
    get totalFrameCount () { return frames && frames.length },
    get currentFrame () { return frames && frames[currentFrameIndex] },
    get currentFrameIndex () { return currentFrameIndex },
  })

  return player

  function load (newFrames) {
    frames = newFrames
    reset()
    player.emit('load', player.currentFrameIndex, player.totalFrameCount)
  }

  function play () {
    intervalHandle = setInterval(playFrame, FRAME_PLAYBACK_INTERVAL / player.playbackSpeed)
  }

  function playFrame () {
    const playing = applyNextFrame()

    if (!playing) {
      player.pause()
    }
    player.emit('nextFrame', player.currentFrameIndex, player.totalFrameCount)
  }

  function pause () {
    clearInterval(intervalHandle)
    intervalHandle = 0
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
    player.emit('nextFrame', player.currentFrameIndex, player.totalFrameCount)

    if (!!intervalHandle) {
      pause()
      play()
    }
  }

  function reset () {
    state.eventLog = []
    currentFrameIndex = -1
    applyNextFrame()
  }

  function applyNextFrame (suppressUpdate = false) {
    const currentFrame = frames[++currentFrameIndex]

    if (currentFrame) {
      applyFrameToState(currentFrame, suppressUpdate)
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
