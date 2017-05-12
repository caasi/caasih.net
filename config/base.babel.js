import path from 'path'
import webpack from 'webpack'
import InlineManifestWebpackPlugin from 'inline-manifest-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import autoprefixer from 'autoprefixer'
import precss from 'precss'
import syntax from 'postcss-scss'
import vendor from './vendor.babel'
import { srcPath, dstPath } from './config.babel'



Error.stackTraceLimit = Infinity

const htmlWebpackOptions = {
  template: path.join(srcPath, 'index.jade'),
  title: 'caasih.net',
}

export default {
  entry: {
    vendor,
    bundle: ['babel-polyfill', path.join(srcPath, 'index.jsx')],
  },
  output: {
    path: dstPath,
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin(htmlWebpackOptions),
    new HtmlWebpackPlugin({
      ...htmlWebpackOptions,
      filename: '404.html',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }
    }),
    new webpack.LoaderOptionsPlugin({
      options: { context: srcPath }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity,
    }),
    new InlineManifestWebpackPlugin({ name: 'webpackManifest' }),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [{
      test: /\.jade/,
      use: 'pug-loader',
    }, {
      test: /\.jsx?$/,
      use: 'babel-loader',
      exclude: /node_modules/,
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
      ],
      exclude: srcPath,
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            localIdentName: '[path][name]__[local]--[hash:base64:5]',
            importLoaders: 1,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            parser: syntax,
            plugins: () => [precss, autoprefixer],
          },
        }
      ],
      include: srcPath,
    }]
  },
}

