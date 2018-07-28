import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Group, Text } from 'react-konva'

// public interface of every component:
//   width: number
//   height: number
//   onResize :: (x: number, number, left: string) => void

// try to draw half of the string until comsuming all the width
class WidthBoundedText extends PureComponent {
  static propTypes = {
    children: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    onResize: PorpTypes.func,
  }

  static defaultProps = {
    x: 0,
    y: 0,
    width: 0,
  }

  textNode = null

  constructor(props) {
    super(props)

    this.state = {
      width: 0,
      index: props.children.length,
    }
  }

  updateDimension() {
    if (!this.textNode) return

    const { index } = this.state
    const width = this.textNode.getWidth()
    const height = this.textNode.getHeight()

    // nothing to render
    if (index === 0) {
      const { onResize } = this.props
      if (typeof onResize === 'function') {
        onResize(width, height, this.props.children)
      }
    }

    // out of the bound width
    if (width > this.props.width) {
      const index = Math.floor(index / 2)
      this.setState({ index })
    }

    // render completed, update the width
    this.setState({ width })
  }

  handleResize = (width, height, left) => {
    const { onResize } = this.props
    if (typeof onResize === 'function') {
      onResize(this.state.width + width, height, left)
    }
  }

  componentDidMount() {
    this.updateDimension()
  }

  componentDidUpdate(prevProps) {
    if (this.props.children !== prevProps.children) {
      this.updateDimension()
    }
  }

  render() {
    const { children, x, y, onResize, ...props } = this.props
    const { width, index } = this.state

    const charArray = [...children]
    const text = charArray.slice(0, index).join('')
    const left = charArray.slice(index).join('')

    return (
      <Fragment>
        <Text
          {...props}
          x={x}
          y={y}
          ref={node => this.textNode = node}
          text={text}
        />
        <WidthBoundedText
          {...props}
          x={x + width}
          y={y}
          width={this.props.width - width}
          onResize={this.handleResize}
        />
      </Fragment>
    )
  }
}

class BoundedText extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    onResize: PropTypes.func,
  }

  static defaultProps = {
    className: '',
    children: '',
    x: 0,
    y: 0,
  }

  textNode = null

  state = {
    width: 0,
    height: 0,
  }

  render() {
    const {
      id,
      className,
      children,
      x,
      y,
      width,
      height,
      onResize,
      ...props,
    } = this.props;

    if (width === undefined) {
      return (
        <Group id={id} className={className} x={x} y={y}>
          <Text
            {...props}
            ref={node => this.textNode = node}
          />
        </Group>
      )
    }

    return ()
  }
}
