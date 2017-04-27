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
      infoDialogOpen: false,
      loadDialogOpen: true,
      loadMapDialogOpen: false,
      eventLog: props.state.eventLog,
    }
  }

  componentDidMount () {
    this.props.state.on('update', newState => this.setState({
      eventLog: newState.eventLog,
    }))
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
    const {loadDialogOpen, infoDialogOpen, loadMapDialogOpen, eventLog} = this.state

    return <div className={styles.container}>
      <div className={styles.topPanel}>
        <HeaderBar
          openLoadProject={() => this.setState({loadDialogOpen: true})}
          openLoadMap={() => this.setState({loadMapDialogOpen: true})}
          openInfo={() => this.setState({infoDialogOpen: true})}
        />
      </div>
      <div className={styles.leftPanel}>
        <UnitList map={map} state={state} player={player}/>
      </div>
      <div className={styles.rightPanel}>
        <EventLog eventLog={eventLog}/>
      </div>
      <div className={styles.bottomPanel}>
        <PlaybackWidget player={player}/>
      </div>
      { loadDialogOpen && <LoadDialog entries={captureIndex} loadCapture={this.loadCapture.bind(this)} closeDialog={() => this.setState({loadDialogOpen: false})} /> }
      { infoDialogOpen && <InfoDialog closeDialog={() => this.setState({infoDialogOpen: false})} /> }
      { loadMapDialogOpen && <LoadMapDialog entries={mapIndex} loadMap={this.loadMap.bind(this)} closeDialog={() => this.setState({loadMapDialogOpen: false})} /> }
    </div>
  }
}
