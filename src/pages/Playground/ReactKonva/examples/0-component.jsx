/* @flow */

import React, { PureComponent } from 'react'

type Props = {
  id?: string,
  className: string
}

class Comp extends PureComponent<Props> {
  static defaultProps = {
    className: ''
  }

  render() {
    const { id, className } = this.props

    return (
      <div id={id} className={className}>
        This is a component.
      </div>
    )
  }
}

export default Comp
