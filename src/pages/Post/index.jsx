/* @flow */

import React, { PureComponent } from 'react'
import cx from 'classnames'
import ReactMarkdown from 'react-markdown'
import { Helmet } from 'react-helmet'
import * as T from 'types'
import * as func from 'types/func'
import Article from 'components/Article'
import CreativeCommons from 'components/CreativeCommons'
import { equals, find, propEq } from 'ramda'
import moment from 'moment'
import profile from 'data/profile.json'
import { index, contents } from 'data/public-post'

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm'

type OwnProps = {
  id?: string,
  className: string,
  pid: string,
}

class Post extends PureComponent<OwnProps> {
  static defaultProps = {
    className: '',
    pid: '',
  }

  render() {
    const { id, className, pid } = this.props
    const classes = cx('caasih-post', 'markdown', className)
    const meta = find(propEq('url', pid), index)
    const post = contents[pid]

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
          <Helmet>
            <title>{ meta.headline } - caasih.net</title>
          </Helmet>
        }
        {
          meta &&
          <header><h1>{ meta.headline }</h1></header>
        }
        <ReactMarkdown id={id} escapeHtml={false} linkTarget="_blank">
          { post }
        </ReactMarkdown>
        <footer className="info">
        {
          meta && meta.license &&
          <CreativeCommons size="compact" {...meta.license} />
        }
        {
          meta &&
          <div>
            <span>由 { profile.name } 發佈於 <time dateTime={publishedAt}>{ publishedAt }</time></span>
            {
              (modifiedAt !== publishedAt) &&
              <span>，並於 { modifiedAt } 更新內容</span>
            }
          </div>
        }
        </footer>
      </Article>
    )
  }
}



export default Post

