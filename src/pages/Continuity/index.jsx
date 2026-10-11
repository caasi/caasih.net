import React from 'react'
import cx from 'classnames'
import ReactMarkdown from 'react-markdown'
import { Helmet } from 'react-helmet'
import Article from 'components/Article'
import content from '!raw-loader!./continuity.md'

const renderers = {
  link: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
}

function Continuity({ id, className }) {
  const classes = cx('caasih-continuity', 'markdown', className)

  return (
    <Article className={classes}>
      <Helmet>
        <title>若我撞卡車 - caasih.net</title>
      </Helmet>
      <ReactMarkdown id={id} escapeHtml={false} renderers={renderers}>
        {content}
      </ReactMarkdown>
    </Article>
  )
}

export default Continuity
