const path = require('path')
const webpack = require('webpack')
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const autoprefixer = require('autoprefixer')
const precss = require('precss')
const syntax = require('postcss-scss')
const { createAliases } = require('./utils')
const { srcPath, dstPath } = require('./config')

Error.stackTraceLimit = Infinity

const htmlWebpackOptions = {
  template: path.join(srcPath, 'index.jade'),
  title: 'caasih.net',
}

const isDevelopment = process.env.NODE_ENV === 'development'

const swcOptions = {
  jsc: {
    parser: {
      syntax: 'ecmascript',
      jsx: true,
      exportDefaultFrom: true,
    },
  },
};

module.exports = {
  entry: {
    bundle: path.join(srcPath, 'index.jsx'),
  },
  output: {
    path: dstPath,
    publicPath: '/',
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin(htmlWebpackOptions),
    new webpack.LoaderOptionsPlugin({
      options: { context: srcPath },
    }),
    new InlineManifestWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.md', '.mdx', '.js', '.jsx'],
    alias: createAliases(srcPath, [
      'components',
      'pages',
      'types',
      'data',
    ]),
  },
  module: {
    rules: [
      {
        test: /\.jade/,
        use: 'pug-loader',
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: swcOptions,
        },
      },
      {
        test: /\.mdx?$/,
        use: [
          {
            loader: 'swc-loader',
            options: swcOptions,
          },
          { loader: '@mdx-js/loader' },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: srcPath,
      },
      {
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
          },
        ],
        include: srcPath,
      },
      {
        test: /\.purs$/,
        loader: 'purs-loader',
        exclude: /node_modules/,
        query: {
          psc: 'psa',
          watch: isDevelopment,
          src: [
            'bower_components/purescript-*/src/**/*.purs',
            'src/pages/Playground/PureScript/**/*.purs',
          ],
        },
      },
    ],
  },
}
