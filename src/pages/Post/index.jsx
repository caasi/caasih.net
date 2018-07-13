import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import ReactMarkdown from 'react-markdown'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import * as actions from 'actions'
import * as func from 'types/func'
import Article from 'components/Article'
import CreativeCommons from 'components/CreativeCommons'
import { equals, find, propEq } from 'ramda'
import moment from 'moment'

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
    const { id, className, profile, meta, post } = this.props
    const classes = cx('caasih-post', className)
    let publishedAt
    let modifiedAt

    if (meta) {
      publishedAt = moment(meta.datePublished).format(DATETIME_FORMAT)
      modifiedAt = moment(meta.dateModified).format(DATETIME_FORMAT)
    }

    return (
      <Article className={classes}>
        {
          meta &&
          <h1>{ meta.headline }</h1>
        }
        <ReactMarkdown id={id} source={post} />
        {
          meta && meta.license &&
          <CreativeCommons size="compact" {...meta.license} />
        }
        {
          meta &&
          <div className="info">
            <span>由 { profile.name } 發佈於 { publishedAt }</span>
            {
              (modifiedAt !== publishedAt) &&
                <span>，並於 { modifiedAt } 更新內容</span>
            }
          </div>
        }
      </Article>
    )
  }
}



export default withRouter(connect(
  (state, router) => {
    const { pid } = router && router.match && router.match.params || {}
    const { profile, post_index = [], post_list = [] } = state || {}
    const meta = find(propEq('url', pid), post_index)
    const post = post_list[pid]

    return { profile, meta, post }
  },
  dispatch => ({ actions: func.map(dispatch, actions) })
)(Post))

