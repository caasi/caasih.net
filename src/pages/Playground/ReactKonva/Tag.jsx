import * as React from 'react'
import { Group, Rect, Text } from 'react-konva'

class Tag extends React.PureComponent {
  static defaultProps = {
    className: '',
    x: 0,
    y: 0,
    fontSize: 12,
    color: 'white',
    backgroundColor: 'black',
  }

  styles = {
    cornerRadius: 6,
    padding: {
      top: 6,
      right: 8,
      bottom: 6,
      left: 8,
    }
  }

  textNode

  constructor(props) {
    super(props)
    this.state = { w: 0, h: 0 }
  }

  updateDimension() {
    if (!this.textNode) return

    const w = this.textNode.getWidth()
    const h = this.textNode.getHeight()

    this.setState({ w, h })

    const { onResize } = this.props
    if (onResize) {
      const { padding } = this.styles
      const width = w + padding.left + padding.right
      const height = h + padding.top + padding.bottom
      onResize(width, height)
    }
  }

  componentDidMount() {
    this.updateDimension()
  }

  componentDidUpdate(prevProps) {
    if (this.props.text !== prevProps.text) {
      this.updateDimension()
    }
  }

  render() {
    const { cornerRadius, padding } = this.styles
    const { x, y, fontSize, text, color, backgroundColor } = this.props
    const { w, h } = this.state
    const width = w + padding.left + padding.right
    const height = h + padding.top + padding.bottom

    return (
      <Group x={x} y={y}>
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          cornerRadius={cornerRadius}
        />
        <Text
          ref={node => this.textNode = node}
          x={padding.left}
          y={padding.top}
          fontSize={fontSize}
          fill={color}
          text={text}
        />
      </Group>
    )
  }
}

export default Tag
