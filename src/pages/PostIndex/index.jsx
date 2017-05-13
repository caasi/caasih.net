import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { connect } from 'react-redux'
import { withRouter, Link, Route } from 'react-router-dom'
import * as actions from 'actions'
import * as func from 'types/func'
import Post from '../Post'
import { map, addIndex } from 'ramda'
import moment from 'moment'

import styles from './index.css'



const idxMap = addIndex(map)

class PostIndex extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    post_index: PropTypes.array,
  }

  static defaultProps = {
    className: '',
    post_index: [],
  }

  componentWillMount() {
    const { actions } = this.props
    actions.postIndex()
  }

  render() {
    const { id, className, match, post_index } = this.props
    const classes = cx(styles.className, 'caasih-post-list', className)

    return (
      <div id={id} className={classes}>
        <ol>{
          idxMap(
            (p, i) =>
              <li key={i}>
                <Link to={`${match.url}/${p.url}`}>{ p.headline }</Link>
                { moment(p.datePublished).format('YYYY-MM-DD HH:mm') }
              </li>,
            post_index
          )
        }</ol>
        <div>
          <Route path={`${match.url}/:pid`} component={Post} />
        </div>
      </div>
    )
  }
}



export default withRouter(connect(
  state => ({ post_index: state.post_index }),
  dispatch => ({ actions: func.map(dispatch, actions) })
)(PostIndex))

