import webpack from 'webpack'
import devConfig from './webpack.config.babel'
let { entry: [,, entry], output, resolve, module, postcss } = devConfig
let { loaders: [babelLoader, cssLoader, jsonLoader] } = module

export default {
  entry,
  output,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ],
  resolve,
  module: {
    loaders: [{
      ...babelLoader,
      query: {
        cacheDirectory: true,
        presets: ['es2015', 'react']
      }
    }, cssLoader, jsonLoader]
  },
  postcss
}
