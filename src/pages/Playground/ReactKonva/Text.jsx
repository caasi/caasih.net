/* @flow */

import * as React from 'react'
import type Konva from 'konva'
import { Text as KonvaText } from 'react-konva'

type Props = {
  onResize?: (width: number, height: number) => void
}

class Text extends React.PureComponent<Props> {
  textNode: KonvaText
  width: number = 0
  height: number = 0

  handleResize() {
    if (!this.textNode) return

    const width = this.textNode.getWidth()
    const height = this.textNode.getHeight()

    if (this.width !== width || this.height !== height) {
      const { onResize } = this.props
      if (typeof onResize === 'function') {
        onResize(width, height)
      }
      this.width = width
      this.height = height
    }
  }

  componentDidMount = this.handleResize
  componentDidUpdate = this.handleResize

  render() {
    const { onResize, ...props } = this.props

    return (<KonvaText {...props} ref={node => this.textNode = node} />)
  }
}

export default Text
