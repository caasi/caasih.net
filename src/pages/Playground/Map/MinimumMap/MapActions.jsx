import React from 'react'
import { Consumer } from './'

function MapActions() {
  return (
    <div>
      <Consumer>{
        ({ actions, objects }) => {
          return (
            <button
              onClick={() => actions.moveRight(objects[0])}
            >
              move right
            </button>
          )
        }
      }</Consumer>
    </div>
  )
}

export default MapActions
