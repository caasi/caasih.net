/* @flow */

import * as React from 'react'
import * as Konva from 'konva'
import { Group, Rect, Text } from 'react-konva'

type State = {
  w: number,
  h: number,
}

class TextInRect extends React.PureComponent<{}, State> {
  padding = {
    vertical: 16,
    horizontal: 8,
  }

  textNode: Text

  constructor(props: {}) {
    super(props)
    this.state = { w: 0, h: 0 }
  }

  updateDimension() {
    if (!this.textNode) return

    const w = this.textNode.getWidth()
    const h = this.textNode.getHeight()

    this.setState({ w, h })
  }

  componentDidMount() {
    this.updateDimension()
  }

  componentDidUpdate() {
    this.updateDimension()
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
          ref={node => this.textNode = node}
          x={this.padding.vertical}
          y={this.padding.horizontal}
          fontSize={32}
          text="much better"
        />
      </Group>
    )
  }
}

export default TextInRect
