import posts from './posts.json'
import { filterPublicPosts } from 'types'

const index = filterPublicPosts(posts)

let contents = {}
for (let p of index) {
  contents[p.url] = require(`!raw-loader!./posts/${p.url}.md`).default;
}

export { index, contents }
