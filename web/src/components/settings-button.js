import React from 'react'
import cx from 'classnames'
import styles from './event-log.css'

export class SettingsButton extends React.Component {
  constructor () {
    super()

    this.state = {
      open: false,
    }
  }

  render () {
    const {buttonClassName, containerClassName} = this.props
    const {open} = this.state

    return <div>
      <div className={cx(styles.button, buttonClassName)}></div>
      <div className={cx(styles.container, containerClassName, open && styles.open)}></div>
    </div>
  }
}
