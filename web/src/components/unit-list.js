import React from 'react'

import cx from 'classnames'
import styles from './unit-list.css'

import { SIDE_NAMES } from '../constants'

export class UnitList extends React.Component {
  constructor () {
    super()

    this.state = {
      openNodes: {},
    }
  }

  componentWillReceiveProps({entities, followedUnit}) {
    if (followedUnit) {
      const openNodes = {...this.state.openNodes}

      openNodes[entities[followedUnit].side] = true
      openNodes[entities[followedUnit].group] = true

      this.setState({
        openNodes,
      })
    }
  }

  createUnitList (units, followedUnit) {
    const {openNodes} = this.state
    const list = {}

    units.forEach(unit => {
      const side = list[unit.side] || (list[unit.side] = {
            name: unit.side,
            groups: {},
            open: openNodes[unit.side] = openNodes[unit.side] || unit.id === followedUnit,
          })

      if (side.open) {
        const group = side.groups[unit.group] || (side.groups[unit.group] = {
            name: unit.group,
            units: {},
            open: openNodes[unit.group] = openNodes[unit.group] || unit.id === followedUnit,
          })

        if (group.open) {
          group.units[unit.id] || (group.units[unit.id] = unit)
        }
      }
    })

    return list
  }

  toggleOpen ({name}) {
    const openNodes = {...this.state.openNodes}

    openNodes[name] = !openNodes[name]

    this.setState({
      openNodes,
    })
  }

  render () {
    const {entities = [], followUnit, followedUnit} = this.props
    const unitList = this.createUnitList(entities.filter(entity => entity.isUnit), followedUnit)

    const sortedList = [unitList.west, unitList.east, unitList.guer, unitList.civ].filter(side => side)

    return <div className={cx(styles.container)}>
      <div className={styles.header}>Units</div>
      <div className={cx(styles.listContainer)}>
        <ul className={styles.list}> {sortedList.map(side =>
            <Side key={side.name} side={side} toggleOpen={this.toggleOpen.bind(this)} followedUnit={followedUnit} followUnit={followUnit}/>
        )}</ul>
      </div>
    </div>
  }
}

function Side({side, side: {name, groups, open}, toggleOpen, followUnit, followedUnit}) {
  return <li className={cx(styles.side)}>
      <span onClick={() => toggleOpen(side)}>
        <span className={cx(styles.collapseButton)}>{open ? '▾' : '▸'}</span>
        <span className={cx(styles.sideName, styles[name])}>{SIDE_NAMES[name]}</span>
      </span>
    { open && <ul className={cx(styles.groupList, open && styles.open)}>{Object.values(groups).map(group =>
        <Group key={group.name} group={group} toggleOpen={toggleOpen} followedUnit={followedUnit} followUnit={followUnit}/>
    )}</ul> }
  </li>
}

function Group({group, group: {name, units, open}, toggleOpen, followUnit, followedUnit}) {
  return <li className={cx(styles.group)}>
      <span onClick={() => toggleOpen(group)}>
        <span className={cx(styles.collapseButton)}>{open ? '▾' : '▸'}</span>
        <span className={cx(styles.groupName)}>{name}</span>
      </span>
    { open && <ul className={cx(styles.unitList, open && styles.open)}>{Object.values(units).map(unit =>
        <Unit key={unit.name} unit={unit} followUnit={followUnit} followedUnit={followedUnit}/>
    )}</ul> }
  </li>
}

function Unit ({unit, followUnit, followedUnit}) {
  const symbols = []
  if (unit.vehicle) {
    symbols.push('✇')
  }

  if (!unit.alive) {
    symbols.push('☠')
  }

  if (unit.id === followedUnit) {
    symbols.push('👁')
  }

  return <li className={cx(styles.unit, !unit.alive && styles.dead)} onClick={() => followUnit(unit)}>
    <span>{unit.name}</span>
    { symbols.map(symbol => <UnitSymbol key={symbol} symbol={symbol}/>) }
  </li>
}

function UnitSymbol ({symbol}) {
  return <span className={styles.unitSymbol}>{symbol}</span>
}
