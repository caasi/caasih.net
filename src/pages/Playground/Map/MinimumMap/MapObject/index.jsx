/* @flow */

import React, { Component } from 'react'
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
  viewport: Viewport,
  selected: boolean,
  onClick?: (e: SyntheticEvent<HTMLDivElement>, obj: Props) => void,
  onMouseDown?: (e: SyntheticEvent<HTMLDivElement>, obj: Props) => void,
  onMouseMove?: (e: SyntheticEvent<HTMLDivElement>, obj: Props) => void,
  onMouseUp?: (e: SyntheticEvent<HTMLDivElement>, obj: Props) => void,
}

function MapObject(obj: Props) {
  const {
    id, className = '',
    x = 0, y = 0, width = 0, height = 0,
    viewport = { x: 0, y: 0, scale: 1.0 },
    selected = false,
    onClick, onMouseDown, onMouseMove, onMouseUp,
  } = obj
  const classes = cx(styles.className, 'minmap-object', { selected }, className)
  const top = viewport.scale * (y - viewport.y)
  const left = viewport.scale * (x - viewport.x)
  const style = {
    top,
    left,
    width: viewport.scale * width,
    height: viewport.scale * height
  }

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
      <span>{`pos: (${x}, ${y})`}</span>
      <br />
      <span>{`dim: (${width}, ${height})`}</span>
    </div>
  )
}

export default MapObject
