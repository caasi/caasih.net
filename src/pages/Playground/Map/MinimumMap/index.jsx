import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import * as state from './state'
import MapObject from './MapObject'
import MapActions from './MapActions'
import styles from './index.css'

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
      select: (obj) => this.setState(state.select(obj)),
      unselect: (obj) => this.setState(state.unselect(obj)),
      dragStart: (pt) => this.setState(state.dragStart(pt)),
      dragEnd: () => this.setState(state.dragEnd()),
      dragMove: (pt) => this.setState(state.dragMove(pt))
    }
  }

  render() {
    const { id, className } = this.props
    const classes = cx(styles.className, 'playground-minmap', className)
    const { actions, objects, selection, isDragging } = this.state

    return (
      <div id={id} className={classes}>
        <div
          className={styles.content}
          onMouseMove={(e) => {
            const pt = { x: e.screenX, y: e.screenY }
            if (isDragging) {
              actions.dragMove(pt)
            }
          }}
        >{
          Object
            .values(objects)
            .map(o => {
              const isSelected = selection.indexOf(o.id) !== -1

              return (
                <MapObject
                  {...o}
                  key={o.id}
                  selected={isSelected}
                  onClick={(e, o) => {
                  }}
                  onMouseDown={(e, o) => {
                    const pt = { x: e.screenX, y: e.screenY }
                    actions.dragStart(pt)
                  }}
                  onMouseUp={(e, o) => {
                    const pt = { x: e.screenX, y: e.screenY }
                    actions.dragEnd()

                    const { startPoint } = this.state
                    if (startPoint.x === pt.x && startPoint.y === pt.y) {
                      isSelected
                        ? actions.unselect(o)
                        : actions.select(o)
                    }
                  }}
                />
              )
            })
        }</div>
        <Provider value={this.state}>
          <MapActions />
        </Provider>
      </div>
    )
  }
}

export default MinimumMap
