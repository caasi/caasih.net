import React, { Component, createContext } from 'react'
import cx from 'classnames'
import * as S from './state'
import MapObject from './MapObject'
import BoundingBox from './BoundingBox'
import MapActions from './MapActions'
import styles from './index.css'

const { Provider, Consumer } = createContext({ state: { objects: {} } })

export { Consumer as Consumer }

type Props = {
  id: string,
  className: string,
}

type State = S.State & {
  actions: {
    scaleViewport: typeof S.scaleViewport,
    dragViewportStart: typeof S.dragViewportStart,
    dragViewportEnd: typeof S.dragViewportEnd,
    dragViewportMove: typeof S.dragViewportMove,
    select: typeof S.select,
    unselect: typeof S.unselect,
    dragStart: typeof S.dragStart,
    dragEnd: typeof S.dragEnd,
    dragMove: typeof S.dragMove,
  }
}

class MinimumMap extends Component<Props, State> {
  static defaultProps = {
    className: '',
  }

  state = {
    ...S.init(640, 480)(),
    actions: {
      scaleViewport: (scale) => this.setState(S.scaleViewport(scale)),
      dragViewportStart: (pt) => this.setState(S.dragViewportStart(pt)),
      dragViewportEnd: () => this.setState(S.dragViewportEnd()),
      dragViewportMove: (pt) => this.setState(S.dragViewportMove(pt)),
      select: (obj) => this.setState(S.select(obj)),
      unselect: (obj) => this.setState(S.unselect(obj)),
      dragStart: (pt) => this.setState(S.dragStart(pt)),
      dragEnd: () => this.setState(S.dragEnd()),
      dragMove: (pt) => this.setState(S.dragMove(pt))
    }
  }

  render() {
    const { id, className } = this.props
    const classes = cx(styles.className, 'playground-minmap', className)
    const {
      actions,
      screen, viewport, isDraggingV,
      objects,
      selection, boundingBox,
      isDragging
    } = this.state

    return (
      <div id={id} className={classes}>
        <div
          className={styles.content}
          onMouseDown={(e) => {
            actions.dragViewportStart({ x: -e.clientX, y: -e.clientY })
          }}
          onMouseMove={(e) => {
            if (isDraggingV) {
              actions.dragViewportMove({ x: -e.clientX, y: -e.clientY })
            }
            if (isDragging) {
              actions.dragMove({ x: e.clientX, y: e.clientY })
            }
          }}
          onMouseUp={(e) => {
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
                    screen={screen}
                    viewport={viewport}
                    selected={isSelected}
                    onClick={(e, o) => {
                    }}
                    onMouseDown={(e, o) => {
                      e.stopPropagation()

                      actions.dragStart({ x: e.clientX, y: e.clientY })
                    }}
                    onMouseUp={(e, o) => {
                      e.stopPropagation()

                      const pt = { x: e.clientX, y: e.clientY }
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
          <BoundingBox {...boundingBox} screen={screen} viewport={viewport} />
        </div>
        <Provider value={this.state}>
          <MapActions />
        </Provider>
      </div>
    )
  }
}

export default MinimumMap
