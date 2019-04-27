/* @flow */

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

// TODO: move to func.js
export const filterPublicPosts = filter(compose(not, prop('private')))
