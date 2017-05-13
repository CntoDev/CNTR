import React from 'react'

import { ModalDialog } from './modal-dialog.js'

import packageInfo from '../../package.json'

import styles from './info-dialog.css'

export function InfoDialog ({open, onClose}) {
  return <ModalDialog title="About CNTR" open={open} onClose={onClose}>
    <img className={styles.logo} alt="CNTR logo" src="images/cntr-logo.png" />
    <h1>CNTR - Carpe Noctem Tactical Recap</h1>
    <h3>Version {packageInfo.version}</h3>
    <p> Automated After Action Report generator, to recap a mission from a 2D perspective. This tool provides information of tactics and precedures as well as enemies position and friendly fatalities.</p>
    <p><a className={styles.link} href="http://www.carpenoctem.co/">Carpe Noctem's website</a></p>
    <p><a className={styles.link} href="https://github.com/CntoDev/CNTR">Link to GitHub</a></p>
    <p>Based on the idea and work of: <a className={styles.link} href="https://github.com/mistergoodson/CNTR">MisterGoodson</a></p>
    <p>Icons by <a className={styles.link} href="https://icons8.com/">icons8.com</a></p>
  </ModalDialog>
}
