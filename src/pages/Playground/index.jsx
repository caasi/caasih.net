import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { withRouter, Link, Route } from 'react-router-dom'
import List from 'components/List'
import Then from './Then';

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

    return (
      <div id={id} className={classes}>
        <Route path={`${match.url}/then`} render={() => <Then />} />
        <List className={styles.list} label="playground">
          <Link to={`${match.url}/then`}>{'<Then />'}</Link>
        </List>
      </div>
    )
  }
}



export default withRouter(Playground)
