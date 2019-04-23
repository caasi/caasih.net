/* @flow */

import type { State } from 'reducers'
import { compose, filter, not, prop } from 'ramda'

// base types
export type Profile = {
  '@context'?: string,
  '@type'?: string,
  email?: string,
  name: string,
  alternateName?: string,
  gender?: string,
  nationality?: string,
  url?: string,
  sameAs?: string[],
}

export type License = {
  version: string,
  type: string,
}

export type PostMeta = {
  '@context': string,
  '@type': string,
  headline: string,
  author: number,
  datePublished: string,
  dateCreated: string,
  dateModified: string,
  url: string,
  license?: License,
}

// actions
export const NOP = 'NOP'
export type NopAction = {
  type: typeof NOP,
}
export const nop
  : () => NopAction
  = () => ({ type: NOP })

export const PROFILE = 'PROFILE'
export type ProfileAction = {
  type: typeof PROFILE,
  profile: Profile,
}
export const profile
  : Profile => ProfileAction
  = (profile) => ({ type: PROFILE, profile })

export const POST_INDEX = 'POST_INDEX'
export type PostIndexAction = {
  type: typeof POST_INDEX,
  post_index: PostMeta[],
}
export const postIndex
  : PostMeta[] => PostIndexAction
  = (post_index) => ({ type: POST_INDEX, post_index })

export const POST = 'POST'
export type PostAction = {
  type: typeof POST,
  url: string,
  post: string,
}
export const post
  : (string, string) => PostAction
  = (url, post) => ({ type: POST, url, post })

export type Action
  = NopAction
  | ProfileAction
  | PostIndexAction
  | PostAction

// redux types
export type Dispatch = (action: Action | ThunkAction | PromiseAction) => any
export type GetState = () => State
type ThunkAction = (dispatch: Dispatch, getState: GetState) => any
type PromiseAction = Promise<Action>

// TODO: move to func.js
export const filterPublicPosts = filter(compose(not, prop('private')))
