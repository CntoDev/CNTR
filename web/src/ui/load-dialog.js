import React from 'react'
import moment from 'moment'

import styles from './load-dialog.css'

export function LoadDialog ({entries, loadCapture}) {
  return <div className={styles.modal}>
    <div className={styles.modalContainer}>
      <div className={styles.modalHeader}>
        <span>Load mission capture</span>
        <span className={styles.modalCloseButton} onClick={close}>&#10006;</span>
      </div>
      <div className={styles.modalBody}>
        <table>
          <thead>
          <th>Mission</th>
          <th>World</th>
          <th>Duration</th>
          <th>Date</th>
          </thead>
          <tbody>
          {entries.map((entry, index) => <CaptureEntry key={index} entry={entry} onClick={loadCapture}/>)}
          </tbody>
        </table>
      </div>
    </div>
  </div>
}

function CaptureEntry ({entry, entry: {missionName, worldName, duration, date}, onClick}) {
  return <tr onClick={() => onClick(entry)}>
    <td>{missionName}</td>
    <td>{worldName}</td>
    <td>{moment.utc(duration * 1000).format('HH:mm:ss')}</td>
    <td>{moment.unix(date).format('DD.MM.YYYY')}</td>
  </tr>
}
