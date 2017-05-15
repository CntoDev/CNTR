import React from 'react'
import moment from 'moment'

import { ModalDialog } from './modal-dialog.js'

import styles from './load-dialog.css'

export function LoadCaptureDialog ({open, entries, loadCapture, onClose}) {
  return <ModalDialog title="Load mission capture" open={open} onClose={onClose}>
    <table className={styles.captureList}>
      <thead className={styles.captureListHeader}>
        <th className={styles.captureListHeaderItem}>Mission</th>
        <th className={styles.captureListHeaderItem}>World</th>
        <th className={styles.captureListHeaderItem}>Duration</th>
        <th className={styles.captureListHeaderItem}>Date</th>
      </thead>
      <tbody className={styles.captureList}>
        {entries.map(entry  =>
          <CaptureListItem key={entry.date} entry={entry} onClick={() => loadCapture(entry)}/>
        )}
      </tbody>
    </table>
  </ModalDialog>
}

function CaptureListItem ({entry: {missionName, worldName, duration, date}, onClick}) {
  return <tr onClick={onClick} className={styles.captureListItem}>
    <td className={styles.captureListItemProperty}>{missionName}</td>
    <td className={styles.captureListItemProperty}>{worldName}</td>
    <td className={styles.captureListItemProperty}>{moment.utc(duration * 1000).format('HH:mm:ss')}</td>
    <td className={styles.captureListItemProperty}>{moment.unix(date).format('DD.MM.YYYY')}</td>
  </tr>
}
