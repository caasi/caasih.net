/* @flow */

import * as React from 'react'
import { Group } from 'react-konva'

type Props = {
  children: React.Node,
  x: number,
  y: number,
}

type Dimension = {
  width: number,
  height: number,
}

type State = {
  dimensions: Dimension[],
}

class TagList extends React.Component<Props, State> {
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

  getDimension(index: number): Dimension {
    return this.state.dimensions[index] || { width: 0, height: 0 }
  }

  setDimension(index: number, { width = 0, height = 0 }: Dimension = {}) {
    const { dimensions } = this.state
    const dimension = { width, height }
    dimensions[index] = dimension
    this.setState({ dimensions })
    return dimension
  }

  handleResize(index: number): (width: number, height: number) => Dimension {
    return (width, height) => {
      return this.setDimension(index, { width, height })
    }
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
