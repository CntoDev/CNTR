import moment from 'moment'
import React from 'react'

import cx from 'classnames'
import styles from './playback-widget.css'

const MIN_PLAYBACK_SPEED = 1
const MAX_PLAYBACK_SPEED = 20
const INVALID_TIME = '--:--:--'

export class PlaybackWidget extends React.Component {
  constructor () {
    super()

    this.state = {
      playing: false,
      currentFrameIndex: null,
      frameCount: null,
    }
  }

  componentDidMount () {
    this.props.player.on('nextFrame', this.updateTime.bind(this))
    this.props.player.on('load', this.updateTime.bind(this, false))
    window.addEventListener('keypress', this.handleKeyboardInput.bind(this))
  }

  render () {
    const {playing, currentFrameIndex, frameCount} = this.state

    return <div className={styles.container}>
      <span className={cx(styles.playButton, !playing && styles.paused)} onClick={this.togglePlayback.bind(this)}/>
      <TimeDisplay currentFrameIndex={currentFrameIndex} frameCount={frameCount}/>
      <input type="range" className={styles.slider}
             min={0} value={currentFrameIndex || 0} max={frameCount || 0} step={1} onChange={this.skipToFrame.bind(this)}/>
      <PlaybackSpeedWidget player={this.props.player}/>
    </div>
  }

  handleKeyboardInput (event) {
    switch (event.charCode) {
      case 32:
        return this.togglePlayback()
    }
  }

  skipToFrame (event) {
    const value = Number.parseInt(event.target.value)
    this.props.player.goTo(value)
  }

  togglePlayback () {
    const newPlaying = !this.state.playing

    if (newPlaying) {
      this.props.player.play()
    } else {
      this.props.player.pause()
    }

    this.setState({playing: newPlaying})
  }

  updateTime (currentFrameIndex, frameCount) {
    this.setState({
      currentFrameIndex,
      frameCount,
    })
  }
}

function TimeDisplay({currentFrameIndex, frameCount}) {
  const currentTime = (currentFrameIndex !== null) ? moment.utc(currentFrameIndex * 1000).format('HH:mm:ss') : INVALID_TIME
  const endTime = (frameCount !== null) ? moment.utc(frameCount * 1000).format('HH:mm:ss') : INVALID_TIME

  return <span className={styles.timeDisplay}>{currentTime}/{endTime}</span>
}

// TODO: this component should be stateless
export class PlaybackSpeedWidget extends React.Component {
  constructor ({player}) {
    super()

    this.state = {
      sliderVisible: false,
      playbackSpeed: player.playbackSpeed,
    }
  }

  updatePlaybackSpeed (newPlaybackSpeed) {
    this.props.player.playbackSpeed = newPlaybackSpeed
    this.setState({
      playbackSpeed: newPlaybackSpeed,
    })
  }

  render () {
    const {sliderVisible, playbackSpeed} = this.state

    return <div className={cx(styles.playbackSpeedWidget)}>
      <span className={styles.playbackSpeedButton}
            onClick={() => this.setState({sliderVisible: !sliderVisible})}>{playbackSpeed}×</span>
      <input className={cx(styles.playbackSpeedSlider, sliderVisible && styles.visible)}
             type="range" min={MIN_PLAYBACK_SPEED} value={playbackSpeed} max={MAX_PLAYBACK_SPEED} step={1}
             onChange={event => this.updatePlaybackSpeed(Number.parseFloat(event.target.value))}/>
    </div>
  }
}