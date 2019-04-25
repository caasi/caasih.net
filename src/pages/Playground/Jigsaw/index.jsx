import React from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import Article from 'components/Article'
import CreativeCommons from 'components/CreativeCommons'

function AboutJigsaw({ id, className }) {
  const classes = cx('playground-zigzag', className)

  return (
    <Article id={id} className={classes}>
      <Helmet title="Jigsaw - caasih.net" />
      <h1>Jigsaw</h1>
      <p>這裡將準備一個可以幫人拼方形拼圖的工具。</p>
      <CreativeCommons size="compact" type="by" />
    </Article>
  )
}

export default AboutJigsaw
