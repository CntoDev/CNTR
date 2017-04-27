import React from 'react'

import styles from './info-dialog.css'

export function InfoDialog ({closeDialog}) {
  return <div className={styles.modal}>
    <div className={styles.modalContainer}>
      <div className={styles.modalHeader}>
        <span>Info</span>
        <span className={styles.modalCloseButton} onClick={closeDialog}>&#10006;</span>
      </div>
      <div className={styles.modalBody}>
          <img alt="Placeholder image" />
          <h1>NAME OF OUR SYSTEM</h1>
          <p> Automated After Action Report generator, to recap a mission from a 2D perspective. This tool provides information of tactics and precedures as well as enemies position and friendly fatalities.</p>
          <p><a href="http://www.carpenoctem.co/">Carpe Noctem's website</a></p>
          <p><a href="https://github.com/CntoDev/OCAP">Link to GitHub</a></p>
          <p>Based on the idea and work of: <a href="https://github.com/mistergoodson/OCAP">MisterGoodson</a></p>
          <p>Icons by <a href="https://icons8.com/">icons8.com</a></p>
      </div>
    </div>
  </div>
}
