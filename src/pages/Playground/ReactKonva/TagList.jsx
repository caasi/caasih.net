import React, { Component, Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import { Group } from 'react-konva'

class TagList extends Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
  }

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

  getDimension(index) {
    return this.state.dimensions[index] || { width: 0, height: 0 }
  }

  setDimension(index, { width = 0, height = 0 } = {}) {
    const { dimensions } = this.state
    const dimension = { width, height }
    dimensions[index] = dimension
    this.setState({ dimensions })
    return dimension
  }

  handleResize(index) {
    return (width, height) => {
      return this.setDimension(index, { width, height })
    }
  }

  render() {
    const { children, x, y } = this.props
    const count = Children.count(children)
    let xs = []
    for (let i = 0; i < count; ++i) {
      xs[i] = this.getDimension(i).width + this.styles.margin.right
    }
    xs = xs.reduce((acc, value) => acc.concat([acc[acc.length - 1] + value]), [0])

    return (
      <Group x={x} y={y}>
        {Children.map(children, (child, i) =>
          cloneElement(
            child,
            { x: xs[i], onResize: this.handleResize(i) }
          )
        )}
      </Group>
    )
  }
}

export default TagList
