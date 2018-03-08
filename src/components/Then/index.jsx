import React, { Component, Children } from 'react'

class Then extends Component {
  constructor(props) {
    super(props)

    this.state = {}

    for (const k in props) {
      if (k === 'children') continue
      Promise.resolve(props[k]).then(this.update(k))
    }
  }

  componentDidUpdate(prev) {
    for (const k in prev) {
      if (k === 'children') continue
      if (prev[k] !== this.props[k])
        Promise.resolve(this.props[k]).then(this.update(k))
    }
  }

  update = k => v => this.setState({ [k]: v })

  render() {
    if (typeof this.props.children === 'function') {
      return this.props.children({ ...this.state })
    } else {
      const child = Children.only(this.props.children)

      return (
        <child.type {...child.props} {...this.state}>
          { child.children }
        </child.type>
      )
    }
  }
}

export default Then
