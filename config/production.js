const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')



module.exports = {
  mode: 'production',
  output: {
    filename: '[chunkhash].[name].js',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        // TODO: terserOptions
      }),
    ],
  },
}

