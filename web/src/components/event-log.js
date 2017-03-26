import React from 'react'

import cx from 'classnames'
import styles from './event-log.css'

export function EventLog ({eventLog}) {
  return <div className={cx(styles.container)}>
    <div className={cx(styles.header)}>Events</div>
    <div className={cx(styles.listContainer)}>
      <ul className={cx(styles.list)}>{ eventLog }</ul>
    </div>
  </div>
}
