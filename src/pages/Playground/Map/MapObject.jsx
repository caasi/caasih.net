import React, { Component } from 'react'

function MapObject({ x = 0, y = 0, width = 0, height = 0 }) {
  return (
    <div>{`${x}, ${y}, ${width}, ${height}`}</div>
  )
}

export default MapObject
