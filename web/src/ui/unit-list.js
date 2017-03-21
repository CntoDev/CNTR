import React from 'react'
import zip from 'lodash/zip'
import isEqual from 'lodash/isEqual'

import cx from 'classnames'
import styles from './unit-list.css'

export class UnitList extends React.Component {
  constructor () {
    super()

    this.state = {
      units: []
    }
  }

  componentDidMount () {
    this.props.state.on('update', () => {
      this.setState({
        units: this.props.state.entities
          .filter(entity => entity.kind === 'Man')
          .map(({alive, vehicle, group, side, followed}) => ({alive, vehicle, group, side, followed})),
      })
    })
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (nextState.units.length !== this.state.units.length) ||
      zip(this.state.units, nextState.units).some(([prev, next]) => !isEqual(prev, next))
  }

  render () {
    const list = {}
    this.props.state.entities.forEach(entity => {
      if (entity.kind === 'Man') {
        const side = list[entity.side] || (list[entity.side] = {name: entity.side, groups: {}})
        const group = side.groups[entity.group] || (side.groups[entity.group] = {name: entity.group, units: {}})
        const unit = group.units[entity.id] || (group.units[entity.id] = entity)
      }
    })

    const onClick = unit => this.props.state.follow(unit)

    return <div>
      <div className={styles.header}>Units</div>
      <ul className={styles.container}> {Object.values(list).map(({name, groups}) =>
        <Side key={name} name={name} groups={groups} onClick={onClick}/>
      )}</ul>
    </div>
  }
}

function Side ({name, groups, onClick}) {
  return <li className={cx(styles.side)}>
    <span className={cx(styles.sideName, styles[name])}>{name}</span>
    <ul className={styles.groupList}>{Object.values(groups).map(({name, units}) =>
      <Group key={name} name={name} units={units} onClick={onClick}/>
    )}</ul>
  </li>
}

function Group ({name, units, onClick}) {
  return <li className={cx(styles.group)}>
    <span>{name}</span>
    <ul className={styles.unitList}>{Object.values(units).map(unit =>
      <Unit key={unit.name} unit={unit} onClick={onClick}/>
    )}</ul>
  </li>
}

function Unit ({unit, onClick}) {
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

  return <li className={cx(styles.unit, !unit.alive && styles.dead)} onClick={() => onClick(unit)}>
    <span>{unit.name}</span>
    { symbols.map(symbol => <UnitSymbol symbol={symbol}/>) }
  </li>
}

function UnitSymbol ({symbol}) {
  return <span className={styles.unitSymbol}>{symbol}</span>
}