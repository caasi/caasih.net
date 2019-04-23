import './service-worker.js'
import React from 'react'
import { render } from 'react-snapshot'
import { createStore } from 'redux'
import store from './store'
import Root from './Root'
import posts from 'data/posts.json'
import profile from 'data/profile.json'
import { filterPublicPosts } from 'types'

import 'normalize.css/normalize.css'
import './index.css'


// make almost everything static
const post_index = filterPublicPosts(posts)
let post_list = {}
for (let p of post_index) {
  post_list[p.url] = require(`!raw-loader!data/posts/${p.url}.md`)
}

const s = store({
  profile,
  post_index,
  post_list,
})
const rootEl = document.getElementById('app')
render(<Root store={s} />, rootEl)

