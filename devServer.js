import path from 'path'
import express from 'express'
import webpack from 'webpack'
import config from './webpack.config.babel'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'

const app = express();
const compiler = webpack(config);

app
  .use(devMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }))
  .use(hotMiddleware(compiler))
  .get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')))
  .listen(8080, 'localhost', err => {
    if (err) {
      console.log(err)
      return
    }
    console.log('Listening at http://localhost:8080')
  })
