import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './index.css'



class Article extends PureComponent {
  static propTypes = {
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  render() {
    const { id, className, children } = this.props
    const classes = cx(styles.className, 'caasih-article', className)

    return (<article id={id} className={classes}>{children}</article>)
  }
}



export default Article
