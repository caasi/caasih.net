/* @flow */

import React, { PureComponent } from 'react';
import cx from 'classnames'
import type { Box } from '../state'
import { makeTransformers } from '../transform'
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
    const { id, className, screen, viewport, ...box } = this.props
    const classes = cx(styles.className, 'minmap-bounding-box', className)
    const { toScreen } = makeTransformers(screen, viewport)
    const { x: left, y: top, width, height } = toScreen(box)
    const style = { left, top, width, height }

    return (<div id={id} className={classes} style={style} />)
  }
}

export default BoundingBox
