import React from 'react';

import cx from 'classnames';
import styles from './ui.css';

import { UnitList } from './unit-list.js';
import { PlaybackWidget } from './playback-widget.js';
import { HeaderBar } from './header-bar.js';
import { EventLog } from './event-log.js';

export function App({state, map, player}) {
  return <div className={styles.container}>
    <div className={styles.topPanel}>
      <HeaderBar map={map} state={state} player={player}/>
    </div>
    <div className={styles.leftPanel}>
      <UnitList map={map} state={state} player={player}/>
    </div>
    <div className={styles.rightPanel}>
      <EventLog state={state}/>
    </div>
    <div className={styles.bottomPanel}>
      <PlaybackWidget player={player}/>
    </div>
  </div>;
}