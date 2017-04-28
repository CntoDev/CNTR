import React from 'react'

import cx from 'classnames'
import styles from './header-bar.css'

export function HeaderBar ({children}) {
  return <div className={cx(styles.container)}>
    {children}
  </div>
}
