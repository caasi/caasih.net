import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import JSONTree from 'react-json-tree'
import me from '../index.json'

import styles from './index.css'



class App extends Component {
  static propTypes = {
    className: PropTypes.string,
  }

  static defaultProps = {
    className: '',
  }

  render() {
    const { id, className } = this.props
    const classes = cx(styles.className, 'caasih-app', className)

    return (
      <JSONTree
        id={id}
        className={classes}
        data={me}
        shouldExpandNode={() => true}
      />
    )
  }
}



export default App

