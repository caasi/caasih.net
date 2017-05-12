import React, { Component, PropTypes } from 'react'
import cx from 'classnames'

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
      <div id={id} className={classes}>
        卡西是個半調子的碼農。
      </div>
    )
  }
}



export default App

