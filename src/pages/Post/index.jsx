import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import ReactMarkdown from 'react-markdown'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import * as actions from 'actions'
import * as func from 'types/func'
import { equals } from 'ramda'

import styles from './index.css'



class Post extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    post: PropTypes.string,
  }

  static defaultProps = {
    className: '',
    post: '',
  }

  componentWillMount() {
    const { match, actions } = this.props
    actions.post(match.params.pid)
  }

  componentWillUpdate(nextProps) {
    if (!equals(this.props.match.params, nextProps.match.params)) {
      const { match, actions } = nextProps
      actions.post(match.params.pid)
    }
  }

  render() {
    const { id, className, post } = this.props
    const classes = cx(styles.className, 'caasih-post', className)

    return (
      <ReactMarkdown id={id} className={classes} source={post} />
    )
  }
}



export default withRouter(connect(
  (state, router) => {
    const { pid } = router && router.match && router.match.params || {}
    const { post_list = [] } = state || {}
    const post = post_list[pid]

    return { post }
  },
  dispatch => ({ actions: func.map(dispatch, actions) })
)(Post))

