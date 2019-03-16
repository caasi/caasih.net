const merge = require('webpack-merge')
const base = require('./config/base')
const production = require('./config/production')



module.exports = merge(production, base)

