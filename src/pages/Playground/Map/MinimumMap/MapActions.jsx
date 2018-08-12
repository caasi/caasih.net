/* @flow */

import React, { Fragment } from 'react'
import { Consumer } from './'

function MapActions() {
  return (
    <div>
      <Consumer>{
        ({ actions, screen, viewport }) => {
          const scale = viewport.width / screen.width
          return (
            <Fragment>
              <button
                onClick={() => actions.scaleViewport(scale - 0.1)}
              >+</button>
              <button
                onClick={() => actions.scaleViewport(scale + 0.1)}
              >-</button>
            </Fragment>
          )
        }
      }</Consumer>
    </div>
  )
}

export default MapActions
