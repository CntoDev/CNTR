import React from 'react'
import moment from 'moment'

import { ModalDialog } from './modal-dialog.js'

import styles from './load-dialog.css'

export class LoadCaptureDialog extends React.Component {
  constructor () {
    super()

    this.state = {
      sortBy: 'date',
      ascending: false,
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
    const {open, entries, loadCapture, onClose} = this.props
    const {sortBy, ascending} = this.state

    return <ModalDialog title="Load mission capture" open={open} onClose={onClose}>
      <table className={styles.captureList}>
        <thead className={styles.captureListHeader}>
        <HeaderCell setSortBy={this.setSortBy.bind(this)} sortKey={'missionName'} label={'Mission'} sortBy={sortBy}
                    ascending={ascending}/>
        <HeaderCell setSortBy={this.setSortBy.bind(this)} sortKey={'worldDisplayName'} label={'World'} sortBy={sortBy}
                    ascending={ascending}/>
        <HeaderCell setSortBy={this.setSortBy.bind(this)} sortKey={'duration'} label={'Duration'} sortBy={sortBy}
                    ascending={ascending}/>
        <HeaderCell setSortBy={this.setSortBy.bind(this)} sortKey={'date'} label={'Date'} sortBy={sortBy}
                    ascending={ascending}/>
        </thead>
        <tbody className={styles.captureList}>
        {sortListBy(entries, sortBy, ascending).map(entry =>
          <CaptureListItem key={entry.date} entry={entry} onClick={() => loadCapture(entry)}/>
        )}
        </tbody>
      </table>
    </ModalDialog>
  }
}

function CaptureListItem ({entry: {missionName, worldDisplayName, duration, date}, onClick}) {
  return <tr onClick={onClick} className={styles.captureListItem}>
    <td className={styles.captureListItemProperty}>{missionName}</td>
    <td className={styles.captureListItemProperty}>{worldDisplayName}</td>
    <td className={styles.captureListItemProperty}>{moment.utc(duration * 1000).format('HH:mm:ss')}</td>
    <td className={styles.captureListItemProperty}>{moment.unix(date).format('DD.MM.YYYY')}</td>
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
