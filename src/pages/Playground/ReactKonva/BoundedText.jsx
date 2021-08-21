import * as React from 'react'
import * as Konva from 'konva'
import Text from './Text'
import WidthBoundedText from './WidthBoundedText'

class BoundedText extends React.PureComponent {
  static defaultProps = {
    children: '',
    x: 0,
    y: 0,
  }

  textNode

  state = {
    width: 0,
    height: 0,
    left: '',
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.children !== prevProps.children ||
      this.props.width !== prevProps.width ||
      this.props.height !== prevProps.height
    ) {
      this.setState({ width: 0, height: 0, left: '' })
    }
  }

  handleTextResize = (width, height, left = '') => {
    const { width: maxWidth, onResize } = this.props

    if (maxWidth === undefined) {
      const width = this.textNode.getWidth()
      const height = this.textNode.getHeight()
      if (onResize) {
        onResize(width, height, '')
      }
      return
    }

    if (left.length === 0) {
      if (onResize) {
        onResize(width, height, left)
      }
    }

    this.setState({ width, height, left })
  }

  handleResize = (width, height, left) => {
    const { onResize } = this.props
    const { width: textWidth, height: textHeight } = this.state

    if (onResize) {
      onResize(
        textWidth > width ? textWidth : width,
        textHeight + height,
        left
      )
    }
  }

  render() {
    const {
      children,
      x,
      y,
      width: maxWidth,
      height: maxHeight,
      ...props
    } = this.props;

    if (maxWidth === undefined) {
      return (
        <Text
          {...props}
          x={x}
          y={y}
          text={children}
          onResize={this.handleTextResize}
        />
      )
    }

    if (maxHeight === undefined) {
      const { width, height, left } = this.state
      const length = [...left].length

      return (
        <React.Fragment>
          <WidthBoundedText
            {...props}
            x={x}
            y={y}
            width={maxWidth}
            onResize={this.handleTextResize}
          >
            {children}
          </WidthBoundedText>
          {
            length !== 0 &&
            <BoundedText
              {...props}
              x={x}
              y={y + height}
              width={maxWidth}
              onResize={this.handleResize}
            >
              {left}
            </BoundedText>
          }
        </React.Fragment>
      )
    }

    return null
  }
}

export default BoundedText
