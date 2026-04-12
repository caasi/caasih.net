// Custom Jest resolver that handles "node:" protocol imports for Jest 24.
//
// Newer transitive deps (parse5-parser-stream, undici, cheerio) use
// "node:stream", "node:assert", etc. which Jest 24 cannot resolve.
//
// For "node:X" where X is a built-in, we return a path to a generated
// shim file that re-exports the built-in via bare require('X').

const path = require('path')
const fs = require('fs')

const shimDir = path.join(__dirname, '.jest-node-shims')

function ensureShim(moduleName) {
  const safeName = moduleName.replace(/\//g, '__')
  const shimPath = path.join(shimDir, safeName + '.js')
  if (!fs.existsSync(shimPath)) {
    if (!fs.existsSync(shimDir)) {
      fs.mkdirSync(shimDir, { recursive: true })
    }
    fs.writeFileSync(shimPath, `module.exports = require('${moduleName}');\n`)
  }
  return shimPath
}

module.exports = (request, options) => {
  if (request.startsWith('node:')) {
    return ensureShim(request.slice(5))
  }
  return options.defaultResolver(request, options)
}
