import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { withRouter, Link, Route } from 'react-router-dom'
import List from 'components/List'
import Then from './Then'
import ReactKonva from './ReactKonva'

import styles from './index.css'




class Playground extends Component {
  static propTypes = {
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  render() {
    const { id, className, match } = this.props
    const classes = cx(styles.className, 'caasih-playground-list', className)
    const paths = {
      'then': `${match.url}/then`,
      'react-konva': `${match.url}/react-konva`,
    }

    return (
      <div id={id} className={classes}>
        <Route path={paths['then']} render={() => <Then />} />
        <Route path={paths['react-konva']} render={() => <ReactKonva />} />
        <List className={styles.list} label="playground">
          <Link to={paths['then']}>{'<Then />'}</Link>
          <Link to={paths['react-konva']}>{'React Konva'}</Link>
        </List>
      </div>
    )
  }
}



export default withRouter(Playground)
