import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import * as state from './state'
import MapObject from './MapObject'
import MapActions from './MapActions'

const { Provider, Consumer } = createContext({ state: { objects: {} } })

export { Consumer as Consumer }

class MinimumMap extends Component {
  static propTypes = {
    className: PropTypes.string,
  }

  static defaultProps = {
    className: '',
  }

  state = {
    ...state.init(),
    actions: {
      moveRight: (obj) => this.setState(state.moveRight(obj))
    }
  }

  render() {
    const { id, className } = this.props
    const classes = cx('playground-minimum-map', className)
    const { actions, objects } = this.state

    return (
      <div id={id} className={classes}>
        <ul>{
          Object
            .values(objects)
            .map(o => <li key={o.id}><MapObject {...o} /></li>)
        }</ul>
        <Provider value={this.state}>
          <MapActions />
        </Provider>
      </div>
    )
  }
}

export default MinimumMap
