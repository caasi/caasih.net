/* @flow */

import React, { PureComponent } from 'react';
import cx from 'classnames'
import type { Viewport } from '../state'
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
  viewport: Viewport,
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
    const { id, className, x, y, width, height, viewport } = this.props
    const classes = cx(styles.className, 'minmap-bounding-box', className)
    const top = viewport.scale * (y - viewport.y)
    const left = viewport.scale * (x - viewport.x)
    const style = {
      top,
      left,
      width: viewport.scale * width,
      height: viewport.scale * height
    }

    return (<div id={id} className={classes} style={style} />)
  }
}

export default BoundingBox
