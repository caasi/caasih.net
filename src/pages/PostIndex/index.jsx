import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { connect } from 'react-redux'
import { withRouter, Link, Route } from 'react-router-dom'
import * as actions from 'actions'
import * as func from 'types/func'
import List from 'components/List'
import Post from '../Post'
import { compose, map, filter, not, prop } from 'ramda'
import moment from 'moment'

import styles from './index.css'

const filterPublicPosts = filter(compose(not, prop('private')))



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
    actions.profile()
    actions.postIndex()
  }

  render() {
    const { id, className, match, post_index } = this.props
    const classes = cx(styles.className, 'caasih-post-list', className)

    return (
      <div id={id} className={classes}>
        <Route path={`${match.url}/:pid`} component={Post} />
        <List className={styles.list} label="posts">{
          map(
            p =>
              <Link
                key={p.url}
                title={`發表於 ${moment(p.datePublished).format('YYYY-MM-DD HH:mm')}`}
                to={`${match.url}/${p.url}`}
              >
                { p.headline }
              </Link>,
            post_index
          )
        }</List>
      </div>
    )
  }
}



export default withRouter(connect(
  state => ({ post_index: filterPublicPosts(state.post_index) }),
  dispatch => ({ actions: func.map(dispatch, actions) })
)(PostIndex))

