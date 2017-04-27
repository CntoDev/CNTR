import React from 'react'

import cx from 'classnames'
import styles from './header-bar.css'

export function HeaderBar ({openLoadProject, openLoadMap, openInfo}) {
  return <div className={cx(styles.container)}>
    <div className={cx(styles.logo)}></div>
    <div className={cx(styles.loadButton)} onClick={openLoadProject}></div>
    <div className={cx(styles.loadMapButton)} onClick={openLoadMap}></div>
    <div className={cx(styles.infoButton)} onClick={openInfo}></div>
  </div>
}