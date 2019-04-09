/* @flow */

import React, { PureComponent } from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { profile, postIndex } from 'actions'
import * as T from 'types'
import * as func from 'types/func'
import List from 'components/List'
import { compose, map, filter, not, prop } from 'ramda'
import moment from 'moment'

import styles from './index.css'

const actions = { profile, postIndex }
const filterPublicPosts = filter(compose(not, prop('private')))

type OwnProps = {
  id?: string,
  className: string,
  post_index: T.PostMeta[],
}

type Props = OwnProps

class PostIndex extends PureComponent<Props> {
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
    const classes = cx(styles.className, 'caasih-post-list', className, styles.list)

    return (
      <List id={id} className={styles.list} label="posts">{
        map(
          p =>
            <Link
              key={p.url}
              title={`發表於 ${moment(p.datePublished).format('YYYY-MM-DD HH:mm')}`}
              to={`/posts/${p.url}`}
            >
              { p.headline }
            </Link>,
          post_index
        )
      }</List>
    )
  }
}

export default connect(
  state => ({ post_index: filterPublicPosts(state.post_index) }),
  dispatch => ({ actions: func.map(dispatch, actions) })
)(PostIndex)
