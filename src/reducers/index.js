/* @flow */

import * as T from 'types'

export type State = {
  profile: T.Profile,
  post_index: T.PostMeta[],
  post_list: { [key: string]: string },
}

export const initialState: State = {
  profile: { name: '...' },
  post_index: [],
  post_list: {},
}

export default (state: State = initialState, action: T.Action): State => {
  switch(action.type) {
    case T.NOP: {
      console.warn('nop!')
      return state
    }

    case T.PROFILE: {
      const { profile } = action

      return {
        ...state,
        profile,
      }
    }

    case T.POST_INDEX: {
      const { post_index } = action

      return {
        ...state,
        post_index,
      }
    }

    case T.POST: {
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

