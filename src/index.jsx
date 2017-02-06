import { AppContainer } from 'react-hot-loader'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import 'normalize.css/normalize.css'
import './index.css'

const rootEl = document.getElementById('app')
const render = Comp =>
  ReactDOM.render(
    <AppContainer>
      <Comp />
    </AppContainer>,
    rootEl
  )

render(App)
if (module.hot) module.hot.accept('./App', () => render(App))
