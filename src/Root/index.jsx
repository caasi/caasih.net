import React from 'react'
import cx from 'classnames'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route, Redirect, Link } from 'react-router-dom'
import ScrollToTop from 'components/ScrollToTop'
import PostIndex from 'pages/PostIndex'

import styles from './index.css'



const Root = ({ id, className, store }) => {
  const classes = cx(styles.className, 'caasih', className)

  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop as="div" id={id} className={classes}>
          <h1>caasih.net</h1>
          <nav id={styles.menu}>
            <ul>
              <li><Link to="/posts">posts</Link></li>
            </ul>
          </nav>
          <div id={styles.container}>
            <Route exact path="/" render={() => <Redirect to="/posts" />} />
            <Route path="/posts" component={PostIndex} />
          </div>
        </ScrollToTop>
      </Router>
    </Provider>
  )
}



export default Root

