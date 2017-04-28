import React from 'react'

import cx from 'classnames'
import styles from './app.css'

import { parse } from '../parser.js'
import { UnitList } from './unit-list.js'
import { PlaybackWidget } from './playback-widget.js'
import { HeaderBar } from './header-bar.js'
import { LoadDialog } from './load-dialog.js'
import { InfoDialog } from './info-dialog.js'
import { LoadMapDialog } from './load-map-dialog.js'
import { EventLog } from './event-log.js'

export class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      loadDialogOpen: true,
      infoDialogOpen: false,
      loadMapDialogOpen: false,
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
      player.reset()
    }).then(() => {
      this.setState({
        loadDialogOpen: false
      })
    })
  }

  closeAllDialogs() {
    this.setState({
      loadDialogOpen: false,
      infoDialogOpen: false,
      loadMapDialogOpen: false,
    })
  }

  loadMap (entry) {
    const {state, map, mapIndex} = this.props
    const worldInfo = mapIndex.find(world => world.worldName.toLowerCase() === entry.worldName.toLowerCase())

    state.reset()
    map.loadWorld(worldInfo)
    this.setState({
      loadMapDialogOpen: false
    })
  }

  render () {
    const {state, map, player, captureIndex, mapIndex} = this.props
    const {loadDialogOpen, infoDialogOpen, loadMapDialogOpen, eventLog, playback} = this.state

    const setPlaybackSpeed = newPlaybackSpeed => player.playbackSpeed = newPlaybackSpeed

    return <div className={styles.container}>
      <div className={styles.topPanel}>
        <HeaderBar>
          <div className={cx(styles.logo)} />
          <button className={cx(styles.button, styles.loadButton)} onClick={() => this.setState({loadDialogOpen: true})} />
          <button className={cx(styles.button, styles.loadMapButton)} onClick={() => this.setState({loadMapDialogOpen: true})} />
          <button className={cx(styles.button, styles.infoButton)} onClick={() => this.setState({infoDialogOpen: true})} />
        </HeaderBar>
      </div>
      <div className={styles.leftPanel}>
        <UnitList map={map} state={state} player={player}/>
      </div>
      <div className={styles.rightPanel}>
        <EventLog eventLog={eventLog}/>
      </div>
      <div className={styles.bottomPanel}>
        <PlaybackWidget togglePlayback={player.togglePlayback} goTo={player.goTo} setPlaybackSpeed={setPlaybackSpeed} playback={playback}/>
      </div>

      <LoadDialog open={loadDialogOpen} onClose={this.closeAllDialogs.bind(this)} entries={captureIndex} loadCapture={this.loadCapture.bind(this)} />
      <LoadMapDialog open={loadMapDialogOpen} onClose={this.closeAllDialogs.bind(this)} maps={mapIndex} loadMap={this.loadMap.bind(this)} />
      <InfoDialog open={infoDialogOpen} onClose={this.closeAllDialogs.bind(this)} />
    </div>
  }
}
