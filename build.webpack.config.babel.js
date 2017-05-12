import merge from 'webpack-merge'
import base from './config/base.babel'
import production from './config/production.babel'



export default merge(production, base)

