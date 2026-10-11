import * as React from 'react'
import { Group } from 'react-konva'

class TagList extends React.Component {
  static defaultProps = {
    x: 0,
    y: 0,
  }

  state = {
    dimensions: [],
  }

  styles = {
    margin: {
      right: 8,
    }
  }

  resizeHandlers = []

  getDimension(index) {
    return this.state.dimensions[index] || { width: 0, height: 0 }
  }

  setDimension(index, { width = 0, height = 0 } = {}) {
    const dimension = { width, height }
    this.setState(({ dimensions }) => ({
      dimensions: Object.assign([], dimensions, { [index]: dimension }),
    }))
    return dimension
  }

  handleResize(index) {
    if (!this.resizeHandlers[index]) {
      this.resizeHandlers[index] = (width, height) =>
        this.setDimension(index, { width, height })
    }
    return this.resizeHandlers[index]
  }

  render() {
    const { children, x, y } = this.props
    const count = React.Children.count(children)
    let xs = []
    for (let i = 0; i < count; ++i) {
      xs[i] = this.getDimension(i).width + this.styles.margin.right
    }
    xs = xs.reduce((acc, value) => acc.concat([acc[acc.length - 1] + value]), [0])

    return (
      <Group x={x} y={y}>
        {React.Children.map(children, (child, i) =>
          React.cloneElement(
            child,
            { x: xs[i], onResize: this.handleResize(i) }
          )
        )}
      </Group>
    )
  }
}

export default TagList
