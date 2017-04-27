import React from 'react'

import styles from './load-map-dialog.css'

export function LoadMapDialog ({entries, loadMap, closeDialog}) {
  return <div className={styles.modal}>
    <div className={styles.modalContainer}>
      <div className={styles.modalHeader}>
        <span>Load mission capture</span>
        <span className={styles.modalCloseButton} onClick={closeDialog}>&#10006;</span>
      </div>
      <div className={styles.modalBody}>
        <table>
          <thead>
          <th>World</th>
          </thead>
          <tbody>
          {entries.map((entry, index) => <CaptureEntry key={index} entry={entry} onClick={loadMap}/>)}
          </tbody>
        </table>
      </div>
    </div>
  </div>
}

function CaptureEntry ({entry, entry: {name}, onClick}) {
  return <tr onClick={() => onClick(entry)}>
    <td>{name}</td>
  </tr>
}
