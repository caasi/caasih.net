/* @flow */

import React, { Component } from 'react'
import cx from 'classnames'
import type { Box } from '../geometry'
import { makeTransformers } from '../transform'
import styles from './index.css'

function round(value) {
  return Math.floor(value * 100) / 100
}

type Props = {
  id: string,
  className?: string,
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  screen: Box,
  viewport: Box,
  selected?: boolean,
  onClick?: (e: SyntheticEvent<HTMLDivElement>, obj: Props) => void,
  onMouseDown?: (e: SyntheticEvent<HTMLDivElement>, obj: Props) => void,
  onMouseMove?: (e: SyntheticEvent<HTMLDivElement>, obj: Props) => void,
  onMouseUp?: (e: SyntheticEvent<HTMLDivElement>, obj: Props) => void,
}

function MapObject(obj: Props) {
  const {
    id, className,
    screen, viewport,
    selected,
    onClick, onMouseDown, onMouseMove, onMouseUp,
    ...box
  } = obj
  const classes = cx(styles.className, 'minmap-object', { selected }, className)
  const { toScreen } = makeTransformers(screen, viewport)
  const { x: left, y: top, width, height } = toScreen(box)
  const style = { left, top, width, height }

  return (
    <div
      id={id}
      className={classes}
      style={style}
      onClick={e => onClick && onClick(e, obj)}
      onMouseDown={e => onMouseDown && onMouseDown(e, obj)}
      onMouseMove={e => onMouseMove && onMouseMove(e, obj)}
      onMouseUp={e => onMouseUp && onMouseUp(e, obj)}
    >
      <span>{`pos: (${round(left)}, ${round(top)})`}</span>
      <br />
      <span>{`dim: (${round(width)}, ${round(height)})`}</span>
    </div>
  )
}

MapObject.defaultProps = {
  className: '',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  selected: false,
}

export default MapObject
