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
  return { ...state, isDragging: true, startPoint: pt, prevPoint: pt }
}

// dragEnd :: () -> Action
export const dragEnd = () => (state) => {
  const origin = { x: 0, y: 0 }
  return { ...state, isDragging: false, startPoint: origin, prevPoint: origin }
}

// dragMove :: Point -> Action
export const dragMove = (pt) => (state) => {
  const { selection, prevPoint } = state
  const vector = { x: pt.x - prevPoint.x, y: pt.y - prevPoint.y }
  const steps = selection.map(getObject(state)).map(moveObject(vector))
  steps.push((state) => ({ ...state, prevPoint: pt }))
  steps.push(updateBoundingBox)
  return compose(...steps)(state)
}

// moveViewport :: Point -> Viewport -> Action
export const moveViewport = (pt) => (vp) => (state) => {
  const viewport = { ...vp, x: vp.x + pt.x, y: vp.y + pt.y }
  return { ...state, viewport }
}

// dragViewportStart :: Point -> Action
export const dragViewportStart = (pt) => (state) => {
  return { ...state, isDraggingV: true, startPointV: pt, prevPointV: pt }
}

// dragViewportEnd :: () -> Action
export const dragViewportEnd = () => (state) => {
  const origin = { x: 0, y: 0 }
  return { ...state, isDraggingV: false, startPointV: origin, prevPointV: origin }
}

// dragViewportMove :: Point -> Action
export const dragViewportMove = (pt) => (state) => {
  const { viewport, prevPointV } = state
  const vector = { x: pt.x - prevPointV.x, y: pt.y - prevPointV.y }
  return compose(
    moveViewport(vector)(viewport),
    (state) => ({ ...state, prevPointV: pt })
  )(state)
}
