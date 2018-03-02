import React, { Component, Children, cloneElement } from 'react'
import { compose, map, toPairs } from 'ramda'

class LiftPromise extends Component {
  constructor(props) {
    super(props)

    compose(
      map(([k, v]) => Promise.resolve(v).then(v => this.setState({ [k]: v }))),
      toPairs
    )(props)

    this.state = {}
  }

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
