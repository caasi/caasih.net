import React, { Component } from 'react'
import cx from 'classnames'
import styles from './index.css'

function MapObject(obj) {
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
