import webpack from 'webpack'
import devConfig from './webpack.config.babel'
import autoprefixer from 'autoprefixer'
let { entry: [,,, entry], output, resolve, module } = devConfig
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
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      options: {
        postcss: [autoprefixer],
      },
    })
  ],
  resolve,
  module: {
    loaders: [
      babelLoader,
      cssLoader,
      jsonLoader
    ]
  },
}
