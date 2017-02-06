import path from 'path'
import webpack from 'webpack'
import autoprefixer from 'autoprefixer'

Error.stackTraceLimit = Infinity

const srcPath = path.resolve(__dirname, 'src')
const dstPath = path.resolve(__dirname)

export default {
  devtool: 'inline-source-map',
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    path.join(srcPath, 'index')
  ],
  output: {
    path: dstPath,
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.LoaderOptionsPlugin({ options: { postcss: [autoprefixer] } }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }, {
      test: /\.css$/,
      loaders: ['style-loader', 'css-loader?modules', 'postcss-loader'],
      include: __dirname,
    }, {
      test: /\.json$/,
      loader: 'json-loader',
    }]
  },
  devServer: {
    host: 'localhost',
    port: 3000,
    historyApiFallback: true,
    hot: true,
  },
}
