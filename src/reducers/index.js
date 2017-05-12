import {
  NOP,
  PROFILE,
} from 'types'



export const initialState = {
  profile: { name: '...' },
}

export default (state = initialState, action) => {
  switch(action.type) {
    case NOP: {
      console.warn('nop!')
      return state
    }

    case PROFILE: {
      const { profile } = action

      return {
        ...state,
        profile,
      }
    }

    default:
      return state
  }
}

