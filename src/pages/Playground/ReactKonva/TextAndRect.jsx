import React from 'react'
import { Group, Rect, Text } from 'react-konva'



function TextAndRect() {
  return (
    <Group>
      <Rect width={30} height={30} fill="red" />
      <Text fontSize={64} text="oops!" />
    </Group>
  )
}



export default TextAndRect
