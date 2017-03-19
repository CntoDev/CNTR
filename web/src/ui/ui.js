import React from 'react';

import cx from 'classnames';
import styles from './ui.css';

import { UnitList } from './unit-list.js';
import { PlaybackWidget } from './playback-widget.js';

export function OcapUi({state, map, player}) {
  return <div className={styles.container}>
    <div className={styles.leftPanel}>
      <UnitList map={map} state={state} player={player}/>
    </div>
    <div className={styles.bottomPanel}>
      <PlaybackWidget player={player}/>
    </div>
  </div>;
}