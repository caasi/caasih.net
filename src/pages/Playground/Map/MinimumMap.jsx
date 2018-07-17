import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
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

  // actions
  updateObject = (obj, next) => {
    const { id } = obj
    const objects = { ...this.state.objects, [id]: obj }
    this.setState({ objects }, next)
  }

  moveRight = (obj, next) => {
    const { x } = obj
    const newObj = { ...obj, x: x + 5 }
    this.updateObject(newObj, next)
  }

  // the store
  state = {
    objects: {
      '0': { id: '0', x: 0, y: 0, width: 100, height: 60 },
    },
    actions: {
      moveRight: (obj) => this.moveRight(obj)
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
