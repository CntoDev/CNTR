import React from 'react'
import moment from 'moment'

import cx from 'classnames'
import styles from './event-log.css'

export function EventLog ({eventLog}) {
  return <div className={cx(styles.container)}>
    <div className={cx(styles.header)}>Events</div>
    <div className={cx(styles.listContainer)}>
      <ul className={cx(styles.list)}>{ eventLog.map((event, index) => <Event key={index} {...event}/>) }</ul>
    </div>
  </div>
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

function KilledLog ({shooter, victim, frameIndex}) {
  const verb = victim.crew ? 'destroyed' : 'killed'
  const byWhom = shooter ? <span> by <span className={styles[shooter.side]}>{shooter.name}</span></span> : null

  return <li className={styles.event}>
    <span className={styles[victim.side]}>{victim.name || victim.description}</span> was {verb}{byWhom}<br />
    <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
  </li>
}

function HitLog ({shooter, victim, frameIndex}) {
  return <li className={styles.event}>
    <span className={styles[victim.side]}>{victim.name || victim.description}</span> was hit by <span
    className={styles[shooter.side]}>{shooter.name}</span><br />
    <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
  </li>
}

function ConnectedLog ({player, frameIndex}) {
  return <li className={styles.event}>
    <span className={styles[player.side]}>{player.name}</span> connected.<br />
    <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
  </li>
}

function DisconnectedLog ({player, frameIndex}) {
  return <li className={styles.event}><span className={styles[player.side]}>{player.name}</span> disconnected.<br />
    <span className={styles.eventDetails}>{moment.utc(frameIndex * 1000).format('HH:mm:ss')}</span>
  </li>
}