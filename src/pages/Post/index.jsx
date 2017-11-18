import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import ReactMarkdown from 'react-markdown'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import * as actions from 'actions'
import * as func from 'types/func'
import CreativeCommons from 'components/CreativeCommons'
import { equals, find, propEq } from 'ramda'
import moment from 'moment'

import styles from './index.css'

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm'



class Post extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    meta: PropTypes.object,
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
    const { id, className, meta, post } = this.props
    const classes = cx(styles.className, 'caasih-post', className)
    let publishedAt
    let modifiedAt

    if (meta) {
      publishedAt = moment(meta.datePublished).format(DATETIME_FORMAT)
      modifiedAt = moment(meta.dateModified).format(DATETIME_FORMAT)
    }

    return (
      <article>
        {
          meta &&
            <ul>
              <li>發佈於 { publishedAt }</li>
              {
                (modifiedAt !== publishedAt) &&
                  <li>修改於 { modifiedAt }</li>
              }
            </ul>
        }
        {
          meta &&
            <h1>{ meta.headline }</h1>
        }
        <ReactMarkdown id={id} className={classes} source={post} />
        {
          meta && meta.license &&
            <CreativeCommons size="compact" {...meta.license} />
        }
      </article>
    )
  }
}



export default withRouter(connect(
  (state, router) => {
    const { pid } = router && router.match && router.match.params || {}
    const { post_index = [], post_list = [] } = state || {}
    const meta = find(propEq('url', pid), post_index)
    const post = post_list[pid]

    return { meta, post }
  },
  dispatch => ({ actions: func.map(dispatch, actions) })
)(Post))

