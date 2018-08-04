/* @flow */

import * as React from 'react'
import { Group } from 'react-konva'

type Props = {
  children: React.Node,
  x: number,
  y: number,
}

type State = {
  width: number,
  height: number,
}

class TagListRec extends React.Component<Props, State> {
  static defaultProps = {
    x: 0,
    y: 0,
  }

  state = {
    width: 0,
    height: 0,
  }

  styles = {
    margin: {
      right: 8,
    }
  }

  handleResize = (width: number, height: number): void => {
    this.setState({ width, height })
  }

  render() {
    const { children, x, y } = this.props
    const { width, height } = this.state
    const [c, ...cs] = React.Children.toArray(children)

    if (c === undefined) return null

    return (
      <Group x={x} y={y}>
        {React.cloneElement(c, { onResize: this.handleResize })}
        <TagListRec x={width + this.styles.margin.right}>
          {cs}
        </TagListRec>
      </Group>
    )
  }
}

export default TagListRec
