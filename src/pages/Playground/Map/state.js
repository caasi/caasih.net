// type State = { objects: { [key: string]: MapObject } }
// type Action = State -> State

// init :: Action
export const init = () => ({
  objects: {
    '0': { id: '0', x: 0, y: 0, width: 100, height: 60 },
  }
})

// updateObject :: MapObject -> Action
export const updateObject = (obj) => (state) => {
  const { id } = obj
  const objects = { ...state.objects, [id]: obj }
  return { objects }
}

// moveRight :: MapObject -> Action
export const moveRight = (obj) => {
  const { x } = obj
  const newObj = { ...obj, x: x + 5 }
  return updateObject(newObj)
}
