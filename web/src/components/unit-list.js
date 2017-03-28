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
          .filter(entity => entity.type === 'Man')
          .map(({alive, vehicle, group, side, followed}) => ({alive, vehicle, group, side, followed})),
      })
    })
  }

  shouldComponentUpdate (_, nextState) {
    return (nextState.units.length !== this.state.units.length) ||
      zip(this.state.units, nextState.units).some(([prev, next]) => !isEqual(prev, next))
  }

  render () {
    const list = {}
    this.props.state.entities.forEach(entity => {
      if (entity.type === 'Man') {
        const side = list[entity.side] || (list[entity.side] = {name: entity.side, groups: {}})
        const group = side.groups[entity.group] || (side.groups[entity.group] = {name: entity.group, units: {}})
        const unit = group.units[entity.id] || (group.units[entity.id] = entity)
      }
    })

    const onClick = unit => this.props.state.follow(unit)

    return <div className={cx(styles.container)}>
        <div className={styles.header}>Units</div>
        <div className={cx(styles.listContainer)}>
          <ul className={styles.list}> {Object.values(list).map(({name, groups}) =>
            <Side key={name} name={name} groups={groups} onClick={onClick}/>
          )}</ul>
        </div>
      </div>
  }
}


export class Side extends React.Component {
  constructor () {
    super()

    this.state = {
      collapsed: true,
    }
  }

  render () {
    const {name, groups, onClick} = this.props;
    const {collapsed} = this.state;

    return <li className={cx(styles.side)}>
      <span className={cx(styles.collapseButton)} onClick={() => this.setState({collapsed: !collapsed})}>{collapsed ? '▸' : '▾'}</span>
      <span className={cx(styles.sideName, styles[name])}>{name}</span>
      <ul className={cx(styles.groupList, collapsed && styles.collapsed)}>{Object.values(groups).map(({name, units}) =>
        <Group key={name} name={name} units={units} onClick={onClick}/>
      )}</ul>
    </li>
  }
}

export class Group extends React.Component {
  constructor () {
    super()

    this.state = {
      collapsed: true,
    }
  }

  render () {
    const {name, units, onClick} = this.props;
    const {collapsed} = this.state;

    return <li className={cx(styles.group)}>
      <span className={cx(styles.collapseButton)} onClick={() => this.setState({collapsed: !collapsed})}>{collapsed ? '▸' : '▾'}</span>
      <span className={cx(styles.groupName)}>{name}</span>
      <ul className={cx(styles.unitList, collapsed && styles.collapsed)}>{Object.values(units).map(unit =>
        <Unit key={unit.name} unit={unit} onClick={onClick}/>
      )}</ul>
    </li>
  }
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