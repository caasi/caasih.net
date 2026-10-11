// Polyfill TextEncoder/TextDecoder before any imports that might need them.
// (undici, loaded transitively via cheerio → enzyme, requires TextDecoder)
//
// This file uses require() instead of import because ES module imports are
// hoisted — the polyfill assignment must execute before enzyme's transitive
// deps trigger side-effects that reference TextDecoder.
const { TextEncoder, TextDecoder } = require('util')
if (global.TextEncoder == null) {
  global.TextEncoder = TextEncoder
}
if (global.TextDecoder == null) {
  global.TextDecoder = TextDecoder
}

require('raf/polyfill')

const { configure } = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')

configure({ adapter: new Adapter() })
