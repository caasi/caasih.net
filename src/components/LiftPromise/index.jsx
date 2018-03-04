import React, { Component, Children } from 'react'

class LiftPromise extends Component {
  constructor(props) {
    super(props)

    this.state = {}

    for (const k in props)
      Promise.resolve(props[k]).then(this.update(k))
  }

  componentDidUpdate(prevProps) {
    for (const k in prevProps)
      if (prevProps[k] !== this.props[k])
        Promise.resolve(this.props[k]).then(this.update(k))
  }

  update = k => v => this.setState({ [k]: v })

  render() {
    const child = Children.only(this.props.children)

    return (
      <child.type {...child.props} {...this.state}>
        { child.children }
      </child.type>
    )
  }
}

export default LiftPromise
