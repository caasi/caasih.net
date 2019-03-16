const merge = require('webpack-merge')
const base = require('./config/base')
const development = require('./config/development')



module.exports = merge(development, base)

