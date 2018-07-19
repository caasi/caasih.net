import React, { Fragment } from 'react'
import { Consumer } from './'

function MapActions() {
  return (
    <div>
      <Consumer>{
        ({ actions, objects }) => {
          return (
            <Fragment>
              <button disabled>+</button>
              <button disabled>-</button>
            </Fragment>
          )
        }
      }</Consumer>
    </div>
  )
}

export default MapActions
