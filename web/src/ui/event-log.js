import React from 'react';

import cx from 'classnames';
import styles from './event-log.css';

export class EventLog extends React.Component {
  constructor() {
    super();

    this.state = {
      eventLog: [],
    };
  }

  componentDidMount() {
    this.props.state.on('update', () => this.setState({
      eventLog: [...this.props.state.eventLog],
    }));
  }

  render() {
    const { eventLog } = this.state;

    return <div>
      <div className={styles.header}>Events</div>
      <ul className={styles.list}>{ eventLog }</ul>
    </div>;
  }
}
