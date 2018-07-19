import React, { Component, createContext } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import * as state from './state'
import MapObject from './MapObject'
import BoundingBox from './BoundingBox'
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
      scaleViewport: (scale) => this.setState(state.scaleViewport(scale)),
      dragViewportStart: (pt) => this.setState(state.dragViewportStart(pt)),
      dragViewportEnd: () => this.setState(state.dragViewportEnd()),
      dragViewportMove: (pt) => this.setState(state.dragViewportMove(pt)),
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
    const {
      actions,
      viewport, isDraggingV,
      objects,
      selection, boundingBox,
      isDragging
    } = this.state

    return (
      <div id={id} className={classes}>
        <div
          className={styles.content}
          onMouseDown={(e) => {
            const pt = { x: -e.clientX, y: -e.clientY }
            actions.dragViewportStart(pt)
          }}
          onMouseMove={(e) => {
            const pt = { x: e.clientX, y: e.clientY }
            if (isDraggingV) {
              actions.dragViewportMove({ x: -pt.x, y: -pt.y })
            }
            if (isDragging) {
              actions.dragMove(pt)
            }
          }}
          onMouseUp={(e) => {
            const pt ={ x: -e.clientX, y: -e.clientY }
            actions.dragViewportEnd()
          }}
        >
          {
            Object
              .values(objects)
              .map(o => {
                const isSelected = selection.indexOf(o.id) !== -1

                return (
                  <MapObject
                    {...o}
                    key={o.id}
                    viewport={viewport}
                    selected={isSelected}
                    onClick={(e, o) => {
                    }}
                    onMouseDown={(e, o) => {
                      e.stopPropagation()

                      const pt = { x: e.clientX, y: e.clientY }
                      actions.dragStart(pt)
                    }}
                    onMouseUp={(e, o) => {
                      e.stopPropagation()

                      const pt = {
                        x: e.clientX / viewport.scale,
                        y: e.clientY / viewport.scale
                      }
                      actions.dragEnd()

                      const { startPoint } = this.state
                      if (
                        Math.abs(startPoint.x - pt.x) < Number.EPSILON &&
                        Math.abs(startPoint.y - pt.y) < Number.EPSILON
                      ) {
                        isSelected
                          ? actions.unselect(o)
                          : actions.select(o)
                      }
                    }}
                  />
                )
              })
          }
          <BoundingBox {...boundingBox} viewport={viewport} />
        </div>
        <Provider value={this.state}>
          <MapActions />
        </Provider>
      </div>
    )
  }
}

export default MinimumMap
