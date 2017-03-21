import React from 'react'

import cx from 'classnames'
import styles from './header-bar.css'

export function HeaderBar ({openLoadProject}) {
  return <div className={cx(styles.container)}>
    <div className={cx(styles.logo)}></div>
    <div className={cx(styles.loadButton)} onClick={openLoadProject}></div>
  </div>
}