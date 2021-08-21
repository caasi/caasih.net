import * as React from 'react'
import { Text as KonvaText } from 'react-konva'

class Text extends React.PureComponent {
  width = 0
  height = 0

  handleResize() {
    if (!this.textNode) return

    const width = this.textNode.width()
    const height = this.textNode.height()

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
