import merge from 'webpack-merge'
import base from './config/base.babel'
import development from './config/development.babel'



export default merge(development, base)

