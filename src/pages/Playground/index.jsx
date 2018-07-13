import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import List from 'components/List'

import styles from './index.css'




class Playground extends Component {
  static propTypes = {
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  render() {
    const { id, className } = this.props
    const classes = cx(styles.className, 'caasih-playground-list', className)

    return (
      <div id={id} className={classes}>
        <List className={styles.list} label="playground">
        </List>
      </div>
    )
  }
}



export default Playground
