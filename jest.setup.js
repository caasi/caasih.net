// Polyfill TextEncoder/TextDecoder before any imports that might need them
// (undici, loaded transitively via cheerio → enzyme, requires TextDecoder)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

require('raf/polyfill')

const { configure } = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')

configure({ adapter: new Adapter() })
