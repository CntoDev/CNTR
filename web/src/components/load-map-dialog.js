import React from 'react'

import { ModalDialog } from './modal-dialog.js'

import styles from './load-map-dialog.css'

export function LoadMapDialog ({open, maps, loadMap, onClose}) {
  return <ModalDialog title="Load empty map" open={open} onClose={onClose}>
    <table className={styles.mapList}>
      <thead className={styles.mapListHeader}>
      <th>World</th>
      </thead>
      <tbody className={styles.mapListBody}>
      {maps.map(map => <CaptureListItem key={map.name} name={map.name} onClick={() => loadMap(map)}/>)}
      </tbody>
    </table>
  </ModalDialog>
}

function CaptureListItem ({name, onClick}) {
  return <tr className={styles.mapListItem} onClick={onClick}>
    <td>{name}</td>
  </tr>
}