import * as T from 'types'
import axios from 'axios'

// TODO: remove all actions

export const nop = store => async () => {
  const { dispatch } = store
  dispatch(T.nop())
}

let pProfile
export const profile = store => async () => {
  const { dispatch } = store

  if (pProfile === undefined) {
    pProfile = axios.get('/data/profile.json').then(r => r.data)
  }

  const result = await pProfile
  dispatch(T.profile(result))

  return result
}

let pPostIndex
export const postIndex = store => async () => {
  const { dispatch } = store

  if (pPostIndex === undefined) {
    pPostIndex = axios.get('/data/posts.json').then(r => r.data)
  }

  const result = await pPostIndex
  dispatch(T.postIndex(result))

  return result
}

let pPost = {}
export const post = store => async (url) => {
  const { dispatch } = store

  if (pPost[url] === undefined) {
    pPost[url] = axios.get(`/data/posts/${url}.md`).then(r => r.data)
  }

  const result = await pPost[url]
  dispatch(T.post(url, result))

  return result
}
