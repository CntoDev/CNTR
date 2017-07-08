/*global fetch, console*/
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
  constructor ({initialState}) {
    super()

    this.state = {
      ...initialState,
    }
  }

  componentDidMount () {
    const { player, map } = this.props

    this.props.player.on('update', this.updatePlaybackState.bind(this))

    window.addEventListener('keypress', ({charCode}) => {
      if (charCode === 32) {
        player.togglePlayback()
      }
    })

    map.setUiState = newState => this.setState(newState, () => map.updateUiState(this.state))
  }

  updatePlaybackState ({state, currentFrameIndex, totalFrameCount, playing, playbackSpeed}) {
    this.setState({
      eventLog: state.eventLog,
      entities: state.entities,
      playback: {
        playing,
        currentFrameIndex,
        totalFrameCount,
        playbackSpeed,
      }
    })
  }

  loadCapture (entry) {
    const {map, player, mapIndex} = this.props

    const worldInfo = mapIndex.find(world => world.worldName.toLowerCase() === entry.worldName.toLowerCase())

    return fetch('data/' + entry.captureFileName).then(response => response.text()).then(parse).then(({frames}) => {
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
    const {map, player, mapIndex} = this.props

    const worldInfo = mapIndex.find(world => world.worldName.toLowerCase() === entry.worldName.toLowerCase())

    map.loadWorld(worldInfo)
    player.load(null)
    player.reset()
    this.setState({
      loadMapDialogOpen: false,
      playback: {
        ...this.state.playback,
        currentFrameIndex: null,
        totalFrameCount: null,
        playing: false,
      },
    })
  }

  render () {
    const {map, player, captureIndex, mapIndex} = this.props
    const {loadCaptureDialogOpen, infoDialogOpen, loadMapDialogOpen, eventLog, playback, showCurators, followedUnit, entities} = this.state

    const setPlaybackSpeed = newPlaybackSpeed => player.playbackSpeed = newPlaybackSpeed

    const followUnit = unit => this.setState({followedUnit: unit.id}, () => map.updateUiState(this.state))

    return <div className={styles.container}>
      <div className={styles.topPanel}>
        <div className={cx(styles.logo)} />
        <button className={cx(styles.button, styles.loadCaptureButton)} onClick={() => this.setState({loadCaptureDialogOpen: true})} />
        <button className={cx(styles.button, styles.loadMapButton)} onClick={() => this.setState({loadMapDialogOpen: true})} />
        <button className={cx(styles.button, styles.infoButton)} onClick={() => this.setState({infoDialogOpen: true})} />
        <button className={cx(styles.button, showCurators ? styles.hideCuratorsButton : styles.showCuratorsButton)} onClick={() => this.setState({showCurators: !showCurators}, () => map.updateUiState(this.state))} />
      </div>
      <div className={styles.leftPanel}>
        <UnitList followUnit={followUnit} followedUnit={followedUnit} entities={entities} player={player}/>
      </div>
      <div className={styles.rightPanel}>
        <EventLog eventLog={eventLog} jumpToEvent={frameIndex => player.goTo(frameIndex)}/>
      </div>
      <div className={styles.bottomPanel}>
        <PlaybackWidget togglePlayback={player.togglePlayback} goTo={player.goTo} setPlaybackSpeed={setPlaybackSpeed} playback={playback}/>
      </div>
      <a className={cx(styles.watermark)} target="_blank" href="http://www.carpenoctem.co/" />
      <LoadCaptureDialog open={loadCaptureDialogOpen} onClose={this.closeAllDialogs.bind(this)} entries={captureIndex} maps={mapIndex} loadCapture={this.loadCapture.bind(this)} />
      <LoadMapDialog open={loadMapDialogOpen} onClose={this.closeAllDialogs.bind(this)} maps={mapIndex} loadMap={this.loadMap.bind(this)} />
      <InfoDialog open={infoDialogOpen} onClose={this.closeAllDialogs.bind(this)} />
    </div>
  }
}
