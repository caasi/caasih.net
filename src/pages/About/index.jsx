import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import * as actions from 'actions'
import * as func from 'types/func'

import styles from './index.css'



class About extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  }

  static defaultProps = {
    className: '',
  }

  componentWillMount() {
    const { actions } = this.props
    actions.profile()
  }

  render() {
    const { id, className, profile, actions } = this.props
    const classes = cx(styles.className, 'caasih-about', className)

    return (
      <div id={id} className={classes}>
        我是 { profile.name } 。
        <a
          href="#"
          onClick={e => {
            e.preventDefault()
            actions.nop()
          }}
        >
          按我！
        </a>
      </div>
    )
  }
}



export default withRouter(connect(
  state => ({ profile: state.profile }),
  dispatch => ({ actions: func.map(dispatch, actions) })
)(About))

