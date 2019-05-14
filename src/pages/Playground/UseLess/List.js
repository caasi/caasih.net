import React, { Children, cloneElement } from 'react'
import useTimeArray from './use-time-array'
import SpaceTime from './SpaceTime'

function List({ data, children }) {
  const x = useTimeArray(data)
  return x === undefined
    ? null
    : (
      <div>
        <SpaceTime>
          {cloneElement(Children.only(children), { data: x })}
        </SpaceTime>
      </div>
    )
}

export default List
