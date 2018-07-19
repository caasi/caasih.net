// type State = { objects: { [key: string]: MapObject } }
// type Action = State -> State

// compose :: [Action] -> Action
const compose = (...fs) => (state) => fs.reduce((s, f) => f(s), state)

// init :: Action
export const init = () => ({
  // TODO: move into the viewport.js
  viewport: {
    x: 0,
    y: 0,
    scale: 1.0,
  },
  // TODO: move into the input.js
  isDraggingV: false,
  startPointV: { x: 0, y: 0 },
  prevPointV: { x: 0, y: 0 },
  objects: {
    '0': { id: '0', x: 0, y: 0, width: 200, height: 160 },
    '1': { id: '1', x: 210, y: 20, width: 300, height: 200 },
  },
  selection: [],
  boundingBox: { x: 0, y: 0, width: 0, height: 0 },
  // TODO: move into the input.js
  isDragging: false,
  startPoint: { x: 0, y: 0 },
  prevPoint: { x: 0, y: 0 },
})

// getObject :: State -> MapID -> MapObject
export const getObject = (state) => (id) => {
  return state.objects[id]
}

// updateObject :: MapObject -> Action
export const updateObject = (obj) => (state) => {
  const { id } = obj
  const objects = { ...state.objects, [id]: obj }
  return { ...state, objects }
}

// updateBoundingBox :: Action
export const updateBoundingBox = (state) => {
  if (state.selection.length === 0) {
    return { ...state, boundingBox: { x: 0, y: 0, width: 0, height: 0 } }
  }

  const box = state.selection
    .map(getObject(state))
    .reduce((box, obj) => {
      const left = obj.x
      const right = obj.x + obj.width
      const top = obj.y
      const bottom = obj.y + obj.height
      return {
        left: left < box.left ? left : box.left,
        top: top < box.top ? top : box.top,
        right: right > box.right ? right : box.right,
        bottom: bottom > box.bottom ? bottom : box.bottom,
      }
    }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity })

  return {
    ...state,
    boundingBox: {
      x: box.left,
      y: box.top,
      width: box.right - box.left,
      height: box.bottom - box.top
    }
  }
}

// select :: MapObject -> Action
const _select = (obj) => (state) => {
  const { id } = obj
  const selection = state.selection.indexOf(id) === -1
    ? [...state.selection, id]
    : state.selection
  return { ...state, selection }
}

export const select = (obj) =>
  compose(
    _select(obj),
    updateBoundingBox,
  )

// unselect :: MapObject -> Action
const _unselect = (obj) => (state) => {
  let selection = []
  for (let id of state.selection) {
    if (id === obj.id) continue
    selection.push(id)
  }
  return { ...state, selection }
}

export const unselect = (obj) =>
  compose(
    _unselect(obj),
    updateBoundingBox,
  )

// moveObject :: Point -> MapObject -> Action
export const moveObject = (pt) => (obj) => {
  const newObj = { ...obj, x: obj.x + pt.x, y: obj.y + pt.y }
  return updateObject(newObj)
}

// dragStart :: Point -> Action
export const dragStart = (pt) => (state) => {
  const { viewport: { scale } } = state
  const pt2 = { x: pt.x / scale, y: pt.y / scale }
  return { ...state, isDragging: true, startPoint: pt2, prevPoint: pt2 }
}

// dragEnd :: () -> Action
export const dragEnd = () => (state) => {
  const origin = { x: 0, y: 0 }
  return { ...state, isDragging: false, startPoint: origin, prevPoint: origin }
}

// dragMove :: Point -> Action
export const dragMove = (pt) => (state) => {
  const { selection, prevPoint, viewport: { scale } } = state
  // scale the input
  // TODO: should do this in the map component
  const pt2 = { x: pt.x / scale, y: pt.y / scale }
  const vector = { x: pt2.x - prevPoint.x, y: pt2.y - prevPoint.y }
  const steps = selection.map(getObject(state)).map(moveObject(vector))
  steps.push((state) => ({ ...state, prevPoint: pt2 }))
  steps.push(updateBoundingBox)
  return compose(...steps)(state)
}

// moveViewport :: Point -> Action
const moveViewport = (pt) => (state) => {
  const vp = state.viewport
  const viewport = { ...vp, x: vp.x + pt.x, y: vp.y + pt.y }
  return { ...state, viewport }
}

// scaleViewport :: Int -> Viewport -> Action
export const scaleViewport = (scale) => (state) => {
  const viewport = { ...state.viewport, scale }
  return { ...state, viewport }
}

// dragViewportStart :: Point -> Action
export const dragViewportStart = (pt) => (state) => {
  const { viewport: { scale } } = state
  const pt2 = { x: pt.x / scale, y: pt.y / scale }
  return { ...state, isDraggingV: true, startPointV: pt2, prevPointV: pt2 }
}

// dragViewportEnd :: () -> Action
export const dragViewportEnd = () => (state) => {
  const origin = { x: 0, y: 0 }
  return { ...state, isDraggingV: false, startPointV: origin, prevPointV: origin }
}

// dragViewportMove :: Point -> Action
export const dragViewportMove = (pt) => (state) => {
  const { prevPointV, viewport: { scale } } = state
  const pt2 = { x: pt.x / scale, y: pt.y / scale }
  const vector = { x: pt2.x - prevPointV.x, y: pt2.y - prevPointV.y }
  return compose(
    moveViewport(vector),
    (state) => ({ ...state, prevPointV: pt2 })
  )(state)
}
