/* @flow */

import React, { PureComponent } from 'react'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import * as T from 'types'
import * as func from 'types/func'
import List from 'components/List'
import { map } from 'ramda'
import moment from 'moment'
import { index } from 'data/public-post'

import styles from './index.css'

/*::
type OwnProps = {
  id?: string,
  className: string,
}
*/

class PostIndex extends PureComponent {
  static defaultProps = {
    className: '',
  }

  render() {
    const { id, className } = this.props
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
          index
        )
      }</List>
    )
  }
}

export default PostIndex
