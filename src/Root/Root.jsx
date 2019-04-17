import React from 'react'
import { Helmet } from 'react-helmet'
import { hot } from 'react-hot-loader/root'
import cx from 'classnames'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route, Redirect, Link } from 'react-router-dom'
import ScrollToTop from 'components/ScrollToTop'
import PostIndex from 'pages/PostIndex'
import Post from 'pages/Post'
import Playground from 'pages/Playground'

import styles from './Root.css'



const Root = ({ id, className, store }) => {
  const classes = cx(styles.className, 'caasih', className)

  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop as="div" id={id} className={classes}>
          <Helmet>
            <title>caasih.net</title>
          </Helmet>
          <h1>caasih.net</h1>
          <main id={styles.container}>
            <Route exact path="/" render={() => <Redirect to="/posts" />} />
            <Route path="/posts" component={({ match }) =>
              <>
                <Route path={`${match.url}/:pid`} component={Post} />
                <PostIndex />
              </>
            } />
            <Route path="/playground" component={Playground} />
          </main>
          <nav id={styles.menu}>
            <ul>
              <li><Link to="/posts">posts</Link></li>
              <li><Link to="/playground">playground</Link></li>
            </ul>
          </nav>
        </ScrollToTop>
      </Router>
    </Provider>
  )
}



export default hot(Root)

