import * as React from 'react'
import Text from './Text'

function initialState(props) {
  const index = props.index || [...props.children].length

  return {
    width: Infinity,
    prevIndex: index,
    index,
  }
}

// try to draw half of the string until comsuming all the width
class WidthBoundedText extends React.PureComponent {
  static defaultProps = {
    children: '',
    x: 0,
    y: 0,
    width: 0,
  }

  constructor(props) {
    super(props)
    this.state = initialState(props)
  }

  handleTextResize = (width, height) => {
    const { index } = this.state

    // nothing to render and trigger the callback to notify ancestors
    if (index === 0) {
      const { onResize } = this.props
      if (typeof onResize === 'function') {
        onResize(width, height, this.props.children)
      }
      return
    }

    const { width: maxWidth } = this.props
    // out of the bound
    // render with half of the text
    if (width > maxWidth) {
      this.setState({ width, index: Math.floor(index / 2), prevIndex: index })
      return
    }

    // render complete
    // update the width and the next `render` will draw the rest text
    this.setState({ width })
  }

  handleResize = (width, height, left) => {
    const { onResize } = this.props
    if (typeof onResize === 'function') {
      onResize(this.state.width + width, height, left)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.children !== prevProps.children ||
      this.props.width !== prevProps.width
    ) {
      this.setState(initialState(this.props))
      return
    }
  }

  render() {
    const { children, x, y, width: maxWidth, onResize, ...props } = this.props
    const { width, index, prevIndex } = this.state

    // naive unicode string manipulations
    const charArray = [...children]
    const text = charArray.slice(0, index).join('')
    const left = charArray.slice(index).join('')

    return (
      <React.Fragment>
        <Text
          {...props}
          x={x}
          y={y}
          text={text}
          onResize={this.handleTextResize}
        />
        {
          index > 0 &&
          width < maxWidth &&
          <WidthBoundedText
            {...props}
            x={x + width}
            y={y}
            width={maxWidth - width}
            index={Math.floor((prevIndex - index) / 2)}
            onResize={this.handleResize}
          >
            {left}
          </WidthBoundedText>
        }
      </React.Fragment>
    )
  }
}

export default WidthBoundedText
