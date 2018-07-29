import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Text as KonvaText } from 'react-konva'

class Text extends PureComponent {
  static propTypes = {
    onResize: PropTypes.func,
  }

  static defaultProps = {
    onResize: (width, height) => {}
  }

  textNode = null
  width = 0
  height = 0

  handleResize() {
    if (!this.textNode) return

    const { onResize } = this.props
    const width = this.textNode.getWidth()
    const height = this.textNode.getHeight()

    if (this.width !== width || this.height !== height) {
      onResize(width, height)
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
