import React from 'react'

import cx from 'classnames'
import styles from './event-log.css'

export function EventLog ({eventLog}) {
  return <div>
    <div className={cx(styles.header)}>Events</div>
    <ul className={cx(styles.list)}>{ eventLog }</ul>
  </div>
}
