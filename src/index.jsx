import './service-worker.js'
import React from 'react'
import { render } from 'react-snapshot'
import Root from './Root'

import './index.css'

const rootEl = document.getElementById('app')
render(<Root />, rootEl)

