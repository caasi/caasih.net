import React, { Fragment } from 'react'
import { Consumer } from './'

function MapActions() {
  return (
    <div>
      <Consumer>{
        ({ actions, viewport }) => {
          return (
            <Fragment>
              <button
                onClick={() => actions.scaleViewport(viewport.scale + 0.1)}
              >+</button>
              <button
                onClick={() => actions.scaleViewport(viewport.scale - 0.1)}
              >-</button>
            </Fragment>
          )
        }
      }</Consumer>
    </div>
  )
}

export default MapActions
