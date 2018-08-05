/* @flow */

import React, { PureComponent } from 'react'
import { Group, Rect } from 'react-konva'
import Text from './Text'

type State = {
  w: number,
  h: number,
}

class TextInRect extends PureComponent<{}, State> {
  padding = {
    vertical: 16,
    horizontal: 8,
  }

  state = { w: 0, h: 0 }

  handleResize = (w: number, h: number) => {
    this.setState({ w, h })
  }

  render() {
    const { w, h } = this.state
    const width = w + 2 * this.padding.vertical
    const height = h + 2 * this.padding.horizontal

    return (
      <Group>
        <Rect
          width={width}
          height={height}
          fill="red"
          cornerRadius={6}
        />
        <Text
          x={this.padding.vertical}
          y={this.padding.horizontal}
          fontSize={32}
          text="much better"
          onResize={this.handleResize}
        />
      </Group>
    )
  }
}

export default TextInRect
