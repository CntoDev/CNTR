import moment from 'moment'
import React from 'react'

import cx from 'classnames'
import styles from './playback-widget.css'

export class PlaybackWidget extends React.Component {
  constructor () {
    super()

    this.state = {
      playing: false,
      currentFrameIndex: -1,
      frameCount: -1,
    }
  }

  componentDidMount () {
    this.props.player.on('nextFrame', this.updateTime.bind(this, true))
    this.props.player.on('load', this.updateTime.bind(this, false))
    window.addEventListener('keypress', this.handleKeyboardInput.bind(this))
  }

  render () {
    const {playing, currentFrameIndex, frameCount} = this.state

    const value = currentFrameIndex
    const max = frameCount - 1
    const currentTime = (currentFrameIndex !== -1) ? moment.utc((currentFrameIndex + 1) * 1000).format('HH:mm:ss') : '--:--:--'
    const endTime = (frameCount !== -1) ? moment.utc(frameCount * 1000).format('HH:mm:ss') : '--:--:--'

    return <div className={styles.container}>
      <span className={cx(styles.playButton, !playing && styles.paused)} onClick={this.togglePlayback.bind(this)}/>
      <span className={styles.timeDisplay}>{currentTime}/{endTime}</span>
      <input className={styles.slider} type="range" min="1" value={value} max={max} step="1"
             onChange={this.skipToFrame.bind(this)}/>
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
    this.props.player.goTo(value - 1)
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

  updateTime (playing, currentFrameIndex, frameCount) {
    this.setState({
      playing,
      currentFrameIndex,
      frameCount,
    })
  }
}

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

    return <div  className={cx(styles.playbackSpeedWidget)}>
      <span className={styles.playbackSpeedButton} onClick={() => this.setState({sliderVisible: !sliderVisible})}>{playbackSpeed}×</span>
      <input className={cx(styles.playbackSpeedSlider, sliderVisible && styles.visible)}
             type="range" min="1" value={playbackSpeed} max="20" step="1"
             onChange={event => this.updatePlaybackSpeed(Number.parseFloat(event.target.value))}/>
    </div>
  }
}