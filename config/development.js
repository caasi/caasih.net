const path = require('path')
const webpack = require('webpack')
const { host, port, srcPath, dstPath } = require('./config')



module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    bundle: [
      'react-hot-loader/patch'
    ],
  },
  output: {
    // one can't use [chunkhash] with hot module replacement,
    // so use [hash] here.
    filename: '[hash].[name].js',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    contentBase: dstPath,
    host,
    port,
    historyApiFallback: true,
    hot: true,
  }
}

