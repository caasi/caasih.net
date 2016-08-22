import path from 'path'
import webpack from 'webpack'
import autoprefixer from 'autoprefixer'

Error.stackTraceLimit = Infinity

const srcPath = path.resolve(__dirname, 'src')
const dstPath = path.resolve(__dirname)

export default {
  devtool: 'source-map',
  entry: [
    'eventsource-polyfill',
    'webpack-hot-middleware/client',
    path.join(srcPath, 'index')
  ],
  output: {
    path: dstPath,
    filename: 'bundle.js',
    publicPath: ''
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      loaders: ['style', 'css?modules', 'postcss'],
      include: __dirname
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  postcss: function() {
    return [autoprefixer]
  }
}
