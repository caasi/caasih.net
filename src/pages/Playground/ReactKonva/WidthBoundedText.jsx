import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Text } from 'react-konva'

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
    onResize: PropTypes.func,
  }

  static defaultProps = {
    children: '',
    x: 0,
    y: 0,
    width: 0,
  }

  textNode = null

  constructor(props) {
    super(props)

    this.state = {
      width: 0,
      index: [...props.children].length,
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
      return
    }

    // out of the bound width
    if (width > this.props.width) {
      this.setState({ width, index: Math.floor(index / 2) })
      return
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

  componentDidUpdate(prevProps, prevState) {
    if (this.props.children !== prevProps.children) {
      this.setState({ width: 0, index: [...this.props.children].length })
      return
    }
    if (this.state.index !== prevState.index) {
      this.updateDimension()
    }
  }

  render() {
    const { children, x, y, width: maxWidth, onResize, ...props } = this.props
    const { width, index } = this.state

    // naive unicode string manipulations
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
        {
          index > 0 &&
          <WidthBoundedText
            {...props}
            x={x + width}
            y={y}
            width={maxWidth - width}
            onResize={this.handleResize}
          >
            {left}
          </WidthBoundedText>
        }
      </Fragment>
    )
  }
}

export default WidthBoundedText
