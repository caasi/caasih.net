import React, { PureComponent } from 'react';
import PropTypes from 'prop-types'
import cx from 'classnames'
import styles from './index.css'

class BoundingBox extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  }

  static defaultProps = {
    className: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }

  render() {
    const { id, className, x, y, width, height } = this.props
    const classes = cx(styles.className, 'minmap-bounding-box', className)
    const style = { top: y, left: x, width, height }

    return (<div id={id} className={classes} style={style} />)
  }
}

export default BoundingBox
