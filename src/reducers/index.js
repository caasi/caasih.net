import {
  NOP,
  PROFILE,
  POST_INDEX,
  POST,
} from 'types'



export const initialState = {
  profile: { name: '...' },
  post_index: [],
  post_list: {},
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

    case POST_INDEX: {
      const { post_index } = action

      return {
        ...state,
        post_index,
      }
    }

    case POST: {
      const { url, post } = action

      return {
        ...state,
        post_list: {
          ...state.post_list,
          [url]: post,
        }
      }
    }

    default:
      return state
  }
}

