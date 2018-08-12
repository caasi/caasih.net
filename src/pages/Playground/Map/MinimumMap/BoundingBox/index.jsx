/* @flow */

import React, { PureComponent } from 'react';
import cx from 'classnames'
import type { Box } from '../state'
import styles from './index.css'

type Props = {
  id: string,
  className: string,
  x: number,
  y: number,
  width: number,
  height: number,
  // TODO:
  //   should create a pre-rendering function instead of passing the
  //   viewport.
  screen: Box,
  viewport: Box,
}

class BoundingBox extends PureComponent<Props> {
  static defaultProps = {
    className: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    viewport: { x: 0, y: 0, scale: 1.0 },
  }

  render() {
    const { id, className, x, y, width, height, screen, viewport } = this.props
    const classes = cx(styles.className, 'minmap-bounding-box', className)
    const scaleX = screen.width / viewport.width
    const scaleY = screen.height / viewport.height
    const top = (y - viewport.y) * scaleY
    const left = (x - viewport.x) * scaleX
    const style = {
      top,
      left,
      width: width * scaleX,
      height: height * scaleY,
    }

    return (<div id={id} className={classes} style={style} />)
  }
}

export default BoundingBox
