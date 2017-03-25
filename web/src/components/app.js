import React from 'react'

import cx from 'classnames'
import styles from './app.css'

import { parse } from '../parser.js'
import { UnitList } from './unit-list.js'
import { PlaybackWidget } from './playback-widget.js'
import { HeaderBar } from './header-bar.js'
import { LoadDialog } from './load-dialog.js'
import { EventLog } from './event-log.js'

export class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      loadDialogOpen: true,
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

    return fetch(entry.captureFilePath).then(response => response.text()).then(parse).then(({frames}) => {
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

  render () {
    const {state, map, player, captureIndex} = this.props
    const {loadDialogOpen, eventLog} = this.state

    return <div className={styles.container}>
      <div className={styles.topPanel}>
        <HeaderBar openLoadProject={() => this.setState({loadDialogOpen: true})}/>
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
      { loadDialogOpen && <LoadDialog entries={captureIndex} loadCapture={this.loadCapture.bind(this)}/> }
    </div>
  }
}
