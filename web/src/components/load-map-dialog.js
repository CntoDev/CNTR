import React from 'react'

import { ModalDialog } from './modal-dialog.js'

import styles from './load-map-dialog.css'

export class LoadMapDialog extends React.Component {
  constructor () {
    super()

    this.state = {
      sortBy: 'name',
      ascending: true,
    }
  }

  setSortBy (newSortBy) {
    const {sortBy, ascending} = this.state

    if (sortBy === newSortBy) {
      this.setState({
        ascending: !ascending,
      })
    } else {
      this.setState({
        sortBy: newSortBy,
      })
    }
  }

  render () {
    const {open, maps, loadMap, onClose} = this.props
    const {sortBy, ascending} = this.state

    return <ModalDialog title="Load mission capture" open={open} onClose={onClose}>
      <table className={styles.mapList}>
        <thead className={styles.mapListHeader}>
        <HeaderCell setSortBy={this.setSortBy.bind(this)} sortKey={'name'} label={'World'} sortBy={sortBy}
                    ascending={ascending}/>
        </thead>
        <tbody className={styles.mapListBody}>
        {sortListBy(maps, sortBy, ascending).map(map =>
          <CaptureListItem key={map.name} name={map.name} onClick={() => loadMap(map)}/>
        )}
        </tbody>
      </table>
    </ModalDialog>
  }
}

function CaptureListItem ({name, onClick}) {
  return <tr className={styles.mapListItem} onClick={onClick}>
    <td>{name}</td>
  </tr>
}

function HeaderCell ({sortKey, setSortBy, label, sortBy, ascending}) {
  const active = sortKey === sortBy
  const sortSymbol = active ? (ascending ? '▴' : '▾') : ' '
  return <th className={styles.captureListHeaderItem} onClick={() => setSortBy(sortKey)}>{label} {sortSymbol}</th>
}

function sortListBy (list, key, ascending) {
  const sortModifier = ascending ? 1 : -1
  return [...list].sort((a, b) => {
    if (a[key] > b[key]) return sortModifier
    if (a[key] < b[key]) return -sortModifier
    return 0
  })
}
