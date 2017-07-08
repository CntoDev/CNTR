import React from 'react'
import moment from 'moment'

import cx from 'classnames'
import styles from './event-log.css'

export class EventLog extends React.Component {
  constructor() {
    super()

    this.state = {
      filter: '',
    }
  }

  updateFilter(newFilter) {
    this.setState({
      filter: newFilter.trim(),
    })
  }

  filterLog(log, filter) {
    if (filter) {
      return log.filter(event => this.getEventPlainText(event).toLowerCase().includes(filter.toLowerCase()))
    } else {
      return log
    }
  }

  getEventPlainText (event) {
    switch (event.type) {
      case 'K': return event.shooter ?
        event.victim.isVehicle ?
          `${event.frameIndex} ${moment.utc(event.frameIndex * 1000).format('HH:mm:ss')} ${event.victim.name} was destroyed by ${event.shooter.name}` :
          `${event.frameIndex} ${moment.utc(event.frameIndex * 1000).format('HH:mm:ss')} ${event.victim.name} was killed by ${event.shooter.name}` :
        event.victim.isVehicle ?
          `${event.frameIndex} ${moment.utc(event.frameIndex * 1000).format('HH:mm:ss')} ${event.victim.name} was destroyed` :
          `${event.frameIndex} ${moment.utc(event.frameIndex * 1000).format('HH:mm:ss')} ${event.victim.name} was killed`
      case 'H': return `${event.frameIndex} ${moment.utc(event.frameIndex * 1000).format('HH:mm:ss')} ${event.victim.name} was hit by ${event.shooter.name}`
      case 'C': return `${event.frameIndex} ${moment.utc(event.frameIndex * 1000).format('HH:mm:ss')} ${event.playerName} connected`
      case 'D': return `${event.frameIndex} ${moment.utc(event.frameIndex * 1000).format('HH:mm:ss')} ${event.playerName} disconnected`
      default: return ''
    }
  }

  render() {
    const {eventLog, jumpToEvent} = this.props
    const {filter} = this.state

    const filteredLog = this.filterLog(eventLog, filter)

    return <div className={cx(styles.container)}>
      <div className={cx(styles.header)}>Events</div>
      <input type="text" className={cx(styles.filterField)} placeholder="Filter..." onChange={({target: {value}}) => this.updateFilter(value)}/>
      <div className={cx(styles.listContainer)}>
        <ul className={cx(styles.list)}>
          { filteredLog.map((event, index) =>
            <Event key={index} {...event} jumpToEvent={() => jumpToEvent(event.frameIndex)}/>
          ) }</ul>
      </div>
    </div>
  }
}

function Event(props) {
  switch (props.type) {
    case 'K': return <KilledLog {...props} />
    case 'H': return <HitLog {...props} />
    case 'C': return <ConnectedLog {...props} />
    case 'D': return <DisconnectedLog {...props} />
    default: return null
  }
}

function KilledLog ({shooter, victim, frameIndex, jumpToEvent}) {
  const verb = victim.isVehicle ? 'destroyed' : 'killed'
  const byWhom = shooter ? <span> by <span className={styles[shooter.side]}>{shooter.name}</span></span> : null

  return <li className={styles.event} onClick={jumpToEvent}>
    <span className={styles[victim.side]}>{victim.name || victim.description}</span> was {verb}{byWhom}.<br />
    <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
  </li>
}

function HitLog ({shooter, victim, frameIndex, jumpToEvent}) {
  return <li className={styles.event} onClick={jumpToEvent}>
    <span className={styles[victim.side]}>{victim.name || victim.description}</span> was hit by <span
    className={styles[shooter.side]}>{shooter.name}</span>.<br />
    <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
  </li>
}

function ConnectedLog ({playerName, frameIndex, jumpToEvent}) {
  return <li className={styles.event} onClick={jumpToEvent}><span>{playerName}</span> connected.<br />
    <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
  </li>
}

function DisconnectedLog ({playerName, frameIndex, jumpToEvent}) {
  return <li className={styles.event} onClick={jumpToEvent}><span>{playerName}</span> disconnected.<br />
    <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
  </li>
}
