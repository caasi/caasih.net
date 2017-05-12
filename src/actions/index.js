import {
  Nop,
  Profile,
} from 'types'
import axios from 'axios'



export const nop = store => async () => {
  const { dispatch } = store
  dispatch(Nop())
}

let pProfile
export const profile = store => async () => {
  const { dispatch } = store

  if (pProfile === undefined) {
    pProfile = axios.get('/data/profile.json').then(r => r.data)
  }

  const result = await pProfile
  dispatch(Profile(result))

  return result
}

