import moment from 'moment'
import React from 'react'

import cx from 'classnames'
import styles from './playback-widget.css'

const MIN_PLAYBACK_SPEED = 1
const MAX_PLAYBACK_SPEED = 20
const INVALID_TIME = '--:--:--'

export function PlaybackWidget({togglePlayback, goTo, setPlaybackSpeed, playback: {playing, currentFrameIndex, totalFrameCount, playbackSpeed}}) {

  return <div className={styles.container}>
    <span className={cx(styles.playButton, !playing && styles.paused)} onClick={togglePlayback}/>
    <TimeDisplay currentFrameIndex={currentFrameIndex} totalFrameCount={totalFrameCount}/>
    <input type="range" className={styles.slider}
           min={0} value={currentFrameIndex || 0} max={totalFrameCount || 0} step={1} onChange={({target: {value}}) => goTo(value)}/>
    <PlaybackSpeedWidget playbackSpeed={playbackSpeed} setPlaybackSpeed={setPlaybackSpeed}/>
  </div>
}

function TimeDisplay({currentFrameIndex, totalFrameCount}) {
  return <span className={styles.timeDisplay}>{formatTime(currentFrameIndex)}/{formatTime(totalFrameCount)}</span>
}

class PlaybackSpeedWidget extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      sliderVisible: false,
    }
  }

  render () {
    const {playbackSpeed, setPlaybackSpeed} = this.props
    const {sliderVisible} = this.state

    return <div className={cx(styles.playbackSpeedWidget)}>
      <span className={styles.playbackSpeedButton}
            onClick={() => this.setState({sliderVisible: !sliderVisible})}>{playbackSpeed}×</span>
      <input className={cx(styles.playbackSpeedSlider, sliderVisible && styles.visible)}
             type="range" min={MIN_PLAYBACK_SPEED} value={playbackSpeed} max={MAX_PLAYBACK_SPEED} step={1}
             onChange={({target: {value}}) => setPlaybackSpeed(value)}/>
    </div>
  }
}

function formatTime(frameIndex) {
  return (frameIndex !== null) ? moment.utc(frameIndex * 1000).format('HH:mm:ss') : INVALID_TIME
}
