import { AppContainer } from 'react-hot-loader'
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import store from './store'
import Root from './Root'

import 'normalize.css/normalize.css'



const s = store()
const rootEl = document.getElementById('app')
const render = Comp =>
  ReactDOM.render(
    <AppContainer>
      <Comp store={s} />
    </AppContainer>,
    rootEl
  )
render(Root)

if (module.hot) {
  module.hot.accept(
    './Root',
    () => render(Root)
  )
}

