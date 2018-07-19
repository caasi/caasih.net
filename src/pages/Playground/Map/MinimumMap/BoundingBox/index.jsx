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
    // TODO:
    //   should create a pre-rendering function instead of passing the
    //   viewport.
    viewport: PropTypes.object,
  }

  static defaultProps = {
    className: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    viewport: { x: 0, y: 0, scale: 1.0 },
  }

  render() {
    const { id, className, x, y, width, height, viewport } = this.props
    const classes = cx(styles.className, 'minmap-bounding-box', className)
    const style = { top: y - viewport.y, left: x - viewport.x, width, height }

    return (<div id={id} className={classes} style={style} />)
  }
}

export default BoundingBox
