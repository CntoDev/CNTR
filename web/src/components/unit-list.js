import React from 'react'

import cx from 'classnames'
import styles from './unit-list.css'

import { SIDE_NAMES } from '../constants'

export class UnitList extends React.Component {
  constructor () {
    super()

    this.state = {
      unitList: {},
    }
  }

  createUnitList (units) {
    const oldList = this.state.unitList
    const list = {}

    units.forEach(unit => {
      const oldSide = oldList[unit.side]
      const side = list[unit.side] || (list[unit.side] = {
            name: unit.side,
            groups: {},
            open: oldSide && oldSide.open,
          })
      side.open = side.open || unit.followed

      const oldGroup = oldList[unit.side] && oldList[unit.side].groups[unit.group]
      const group = side.groups[unit.group] || (side.groups[unit.group] = {
            name: unit.group,
            units: {},
            open: oldGroup && oldGroup.open
          })
      group.open = group.open || unit.followed

      group.units[unit.id] || (group.units[unit.id] = unit)
    })

    return list
  }

  toggleOpen (node) {
    node.open = !node.open

    this.setState({
      unitList: this.state.unitList
    })
  }

  componentDidMount () {
    this.props.state.on('update', () => {
      const units = this.props.state.entities.filter(entity => !entity.crew)
      const unitList = this.createUnitList(units)

      this.setState({
        unitList,
      })
    })
  }

  render () {
    const {state} = this.props
    const {unitList} = this.state

    const followUnit = unit => state.follow(unit)
    const sortedList = [unitList.west, unitList.east, unitList.guer, unitList.civ].filter(side => side)

    return <div className={cx(styles.container)}>
      <div className={styles.header}>Units</div>
      <div className={cx(styles.listContainer)}>
        <ul className={styles.list}> {sortedList.map(side =>
            <Side key={side.name} side={side} toggleOpen={this.toggleOpen.bind(this)} followUnit={followUnit}/>
        )}</ul>
      </div>
    </div>
  }
}

function Side({side, side: {name, groups, open}, toggleOpen, followUnit}) {
  return <li className={cx(styles.side)}>
      <span onClick={() => toggleOpen(side)}>
        <span className={cx(styles.collapseButton)}>{open ? '▾' : '▸'}</span>
        <span className={cx(styles.sideName, styles[name])}>{SIDE_NAMES[name]}</span>
      </span>
    { open && <ul className={cx(styles.groupList, open && styles.open)}>{Object.values(groups).map(group =>
        <Group key={group.name} group={group} toggleOpen={toggleOpen} followUnit={followUnit}/>
    )}</ul> }
  </li>
}

function Group({group, group: {name, units, open}, toggleOpen, followUnit}) {
  return <li className={cx(styles.group)}>
      <span onClick={() => toggleOpen(group)}>
        <span className={cx(styles.collapseButton)}>{open ? '▾' : '▸'}</span>
        <span className={cx(styles.groupName)}>{name}</span>
      </span>
    { open && <ul className={cx(styles.unitList, open && styles.open)}>{Object.values(units).map(unit =>
        <Unit key={unit.name} unit={unit} followUnit={followUnit}/>
    )}</ul> }
  </li>
}

function Unit ({unit, followUnit}) {
  const symbols = []
  if (unit.vehicle) {
    symbols.push('✇')
  }

  if (!unit.alive) {
    symbols.push('☠')//'✝'
  }

  if (unit.followed) {
    symbols.push('👁')//'⌖', '⊕', '✔'
  }

  return <li className={cx(styles.unit, !unit.alive && styles.dead)} onClick={() => followUnit(unit)}>
    <span>{unit.name}</span>
    { symbols.map(symbol => <UnitSymbol symbol={symbol}/>) }
  </li>
}

function UnitSymbol ({symbol}) {
  return <span className={styles.unitSymbol}>{symbol}</span>
}
