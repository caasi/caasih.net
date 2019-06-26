import React from 'react'
import cx from 'classnames'
import Article from 'components/Article'
import { Helmet } from 'react-helmet'

export default (title, baseClassName) => ({ id, className, children }) =>
  <Article id={id} className={cx(baseClassName, className)}>
    <Helmet title={title} />
    {children}
  </Article>
