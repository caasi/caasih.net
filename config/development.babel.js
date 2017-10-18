import path from 'path'
import webpack from 'webpack'
import { host, port, srcPath, dstPath } from './config.babel'



export default {
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

