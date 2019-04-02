const path = require('path')

const host = process.env.HOST || 'localhost'

const port = process.env.PORT || 3000

const srcPath = path.resolve(__dirname, '../src')

const dstPath = path.resolve(__dirname, '../dist')

module.exports = { host, port, srcPath, dstPath }
