import React from 'react'
import cx from 'classnames'

import styles from './app.css'

import { UnitList } from './unit-list.js'
import { PlaybackWidget } from './playback-widget.js'
import { EventLog } from './event-log.js'

import { LoadCaptureDialog } from './load-capture-dialog.js'
import { LoadMapDialog } from './load-map-dialog.js'
import { InfoDialog } from './info-dialog.js'

import { parse } from '../parse.js'

export class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      loadCaptureDialogOpen: true,
      loadMapDialogOpen: false,
      infoDialogOpen: false,
      eventLog: props.state.eventLog,
      playback: {
        currentFrameIndex: null,
        totalFrameCount: null,
        playing: false,
        playbackSpeed: 10,
      }
    }
  }

  componentDidMount () {
    const {player} = this.props

    this.props.state.on('update', newState => this.setState({
      eventLog: newState.eventLog,
    }))

    this.props.player.on('update', this.updatePlaybackState.bind(this))

    window.addEventListener('keypress', ({charCode}) => {
      if (charCode === 32) {
        player.togglePlayback()
      }
    })
  }

  updatePlaybackState ({currentFrameIndex, totalFrameCount, playing, playbackSpeed}) {
    this.setState({
      playback: {
        playing,
        currentFrameIndex,
        totalFrameCount,
        playbackSpeed,
      }
    })
  }

  loadCapture (entry) {
    const {state, map, player, mapIndex} = this.props

    const worldInfo = mapIndex.find(world => world.worldName.toLowerCase() === entry.worldName.toLowerCase())

    return fetch('data/' + entry.captureFileName).then(response => response.text()).then(parse).then(({frames}) => {
      state.reset()
      map.loadWorld(worldInfo)
      player.load(frames)
    }).then(() => {
      this.setState({
        loadCaptureDialogOpen: false,
      })
    })
  }

  closeAllDialogs() {
    this.setState({
      loadCaptureDialogOpen: false,
      loadMapDialogOpen: false,
      infoDialogOpen: false,
    })
  }

  loadMap (entry) {
    const {state, map, player, mapIndex} = this.props

    const worldInfo = mapIndex.find(world => world.worldName.toLowerCase() === entry.worldName.toLowerCase())

    state.reset()
    map.loadWorld(worldInfo)
    player.load(null)
    player.reset()
    this.setState({
      loadMapDialogOpen: false,
      playback: Object.assign({}, this.state.playback, {
        currentFrameIndex: null,
        totalFrameCount: null,
        playing: false,
      }),
    })
  }

  render () {
    const {state, map, player, captureIndex, mapIndex} = this.props
    const {loadCaptureDialogOpen, infoDialogOpen, loadMapDialogOpen, eventLog, playback} = this.state

    const setPlaybackSpeed = newPlaybackSpeed => player.playbackSpeed = newPlaybackSpeed

    return <div className={styles.container}>
      <div className={styles.topPanel}>
        <div className={cx(styles.logo)} />
        <button className={cx(styles.button, styles.loadCaptureButton)} onClick={() => this.setState({loadCaptureDialogOpen: true})} />
        <button className={cx(styles.button, styles.loadMapButton)} onClick={() => this.setState({loadMapDialogOpen: true})} />
        <button className={cx(styles.button, styles.infoButton)} onClick={() => this.setState({infoDialogOpen: true})} />
      </div>
      <div className={styles.leftPanel}>
        <UnitList map={map} state={state} player={player}/>
      </div>
      <div className={styles.rightPanel}>
        <EventLog eventLog={eventLog} jumpToEvent={frameIndex => player.goTo(frameIndex)}/>
      </div>
      <div className={styles.bottomPanel}>
        <PlaybackWidget togglePlayback={player.togglePlayback} goTo={player.goTo} setPlaybackSpeed={setPlaybackSpeed} playback={playback}/>
      </div>
      <a className={cx(styles.watermark)} target="_blank"  href="http://www.carpenoctem.co/" />
      <LoadCaptureDialog open={loadCaptureDialogOpen} onClose={this.closeAllDialogs.bind(this)} entries={captureIndex} loadCapture={this.loadCapture.bind(this)} />
      <LoadMapDialog open={loadMapDialogOpen} onClose={this.closeAllDialogs.bind(this)} maps={mapIndex} loadMap={this.loadMap.bind(this)} />
      <InfoDialog open={infoDialogOpen} onClose={this.closeAllDialogs.bind(this)} />
    </div>
  }
}
