import React, { Component, Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import { Group } from 'react-konva'

class TagListRec extends Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
  }

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

  handleResize = (width, height) => {
    this.setState({ width, height })
  }

  render() {
    const { children, x, y } = this.props
    const { width, height } = this.state
    const [c, ...cs] = Children.toArray(children)

    if (c === undefined) return null

    return (
      <Group x={x} y={y}>
        {cloneElement(c, { onResize: this.handleResize })}
        <TagListRec x={width + this.styles.margin.right}>
          {cs}
        </TagListRec>
      </Group>
    )
  }
}

export default TagListRec
