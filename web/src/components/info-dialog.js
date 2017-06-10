import React from 'react'

import { ModalDialog } from './modal-dialog.js'

import packageInfo from '../../package.json'

import styles from './info-dialog.css'

export function InfoDialog ({open, onClose}) {
  return <ModalDialog title="About CNTR" open={open} onClose={onClose}>
    <div className={styles.wrapper}>
      <a href="http://www.carpenoctem.co/">
      <img className={styles.logo} alt="CNTR logo" src="images/cntr-logo.png"/>
      </a>
      <h1>Carpe Noctem Tactical Recap - CNTR</h1>
    </div>
    <h4>Version {packageInfo.version}</h4>
    <p>CNTR is a recording and playback system for ArmA 3. The system captures infantry and vehicle movement, weapons fire, casualties and many other aspects of an armed operation and stores it for later playback in a 2D environment with functionality similar to that of the Arma 3 map. CNTR thus allows for both planning an operation as well as reviewing team-performance and coordination post-operation.</p>
    <p>
      For more information regarding CNTR, please visit our <a className={styles.link} href="https://github.com/CntoDev/CNTR/">GitHub repository</a>
      <br/>
      If interested in our community, please visit <a className={styles.link} href="http://www.carpenoctem.co/">Carpe Noctem's website</a>
    </p>
    <br/>
    <p>
      CNTR started as a modification to OCAP, in order to suit CNTO's specific needs, but eventually ended up being a complete rewrite of it. This includes a different capture and playback algorithms, as well as a completely new storage format.
      <br/>
      For more information regarding OCAP and its original author  <a className={styles.link} href="https://github.com/mistergoodson">MisterGoodson</a>, please visit or <a className={styles.link} href="https://github.com/mistergoodson/OCAP">OCAP's GitHub repository</a>
    </p>
    <p>This software and its source code are licensed under the terms of the GNU General Public License v3.0 as stated in the <a className={styles.link} href="https://raw.githubusercontent.com/CntoDev/CNTR/master/LICENSE"> LICENSE file </a></p>
    <p>Icons provided by <a className={styles.link} href="https://icons8.com/">icons8.com</a></p>
  </ModalDialog>
}
