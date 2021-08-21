import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import { withRouter, Link, Route, Switch } from 'react-router-dom'
import List from 'components/List'
import Then from './Then'
import ReactKonva from './ReactKonva'
import Map from './Map'
import PureScript from './PureScript'
import ImageData from './ImageData'
import Jigsaw from './Jigsaw'
import UseLess from './UseLess'
import WebVR from './WebVR'
import ReScript from './ReasonML'
import WebGL from './WebGL'

import styles from './index.css'

const paths = [
  'then',
  'react-konva',
  'map',
  'purescript',
  'image-data',
  'jigsaw',
  'useless',
  'web-vr',
  'reasonml',
  'web-gl',
]

class Playground extends Component {
  static defaultProps = {
    className: ''
  }

  render() {
    const { id, className, match } = this.props
    const classes = cx(styles.className, 'caasih-playground-list', className)
    let ps = {}
    for (let p of paths) {
      ps[p] = `${match.url}/${p}`
    }

    return (
      <div id={id} className={classes}>
        <Helmet>
          <title>playground - caasih.net</title>
        </Helmet>
        <Switch>
          <Route path={ps['then']}>
            <Then />
          </Route>
          <Route path={ps['react-konva']}>
            <ReactKonva />
          </Route>
          <Route path={ps['map']}>
            <Map />
          </Route>
          <Route path={ps['purescript']}>
            <PureScript />
          </Route>
          <Route path={ps['image-data']}>
            <ImageData />
          </Route>
          <Route path={ps['jigsaw']}>
            <Jigsaw />
          </Route>
          <Route path={ps['useless']}>
            <UseLess />
          </Route>
          <Route path={ps['web-vr']}>
            <WebVR />
          </Route>
          <Route path={ps['reasonml']}>
            <ReScript />
          </Route>
          <Route path={ps['web-gl']}>
            <WebGL />
          </Route>
        </Switch>
        <List className={styles.list} label="playground">
          <Link to={ps['then']}>{'<Then />'}</Link>
          <Link to={ps['react-konva']}>React Konva</Link>
          <Link to={ps['map']}>Map</Link>
          <Link to={ps['purescript']}>PureScript</Link>
          <Link to={ps['image-data']}>ImageData</Link>
          <Link to={ps['useless']}>無測無用</Link>
          <Link to={ps['web-vr']}>WebVR Playground</Link>
          <Link to={ps['reasonml']}>ReScript</Link>
          <Link to={ps['web-gl']}>WebGL</Link>
        </List>
      </div>
    )
  }
}

export default withRouter(Playground)
