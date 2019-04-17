import './service-worker.js'
import React from 'react'
import { render } from 'react-snapshot'
import { createStore } from 'redux'
import store from './store'
import Root from './Root'

import 'normalize.css/normalize.css'
import './index.css'



const s = store()
const rootEl = document.getElementById('app')
render(<Root store={s} />, rootEl)

