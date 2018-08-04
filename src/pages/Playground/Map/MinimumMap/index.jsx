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
    ...S.init(),
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
