import React from 'react'
import cx from 'classnames'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import About from 'pages/About'
import PostIndex from 'pages/PostIndex'

import styles from './index.css'



const Root = ({ id, className, store }) => {
  const classes = cx(styles.className, 'caasih', className)

  return (
    <Provider store={store}>
      <Router>
        <div id={id} className={className}>
          <ul id={styles.menu}>
            <li><Link to="/posts">posts</Link></li>
            <li><Link to="/about">about</Link></li>
          </ul>
          <div id={styles.container}>
            <Route path="/posts" component={PostIndex} />
            <Route path="/about" component={About} />
          </div>
        </div>
      </Router>
    </Provider>
  )
}



export default Root

