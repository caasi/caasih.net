import React, { Children, cloneElement } from 'react'
import { useArray } from '@caasi/hooks';
import SpaceTime from './SpaceTime'

function List({ data, children }) {
  const x = useArray(data)
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
