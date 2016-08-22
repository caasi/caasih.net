import 'babel-polyfill'
import React from 'react'
import JSONTree from 'react-json-tree'
import { render } from 'react-dom'
import me from './index.json'

import 'normalize.css/normalize.css'
import './index.css'

render(
  <JSONTree
    data={me}
    shouldExpandNode={() => true}
  />,
  document.getElementById('app')
)
