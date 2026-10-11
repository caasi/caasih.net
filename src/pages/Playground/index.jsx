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
import FFXIVStrat from './FFXIVStrat'

import styles from './index.css'

const routes = [
  { path: 'then', label: '<Then />', component: Then },
  { path: 'react-konva', label: 'React Konva', component: ReactKonva },
  { path: 'map', label: 'Map', component: Map },
  { path: 'purescript', label: 'PureScript', component: PureScript },
  { path: 'image-data', label: 'ImageData', component: ImageData },
  { path: 'jigsaw', hidden: true, component: Jigsaw },
  { path: 'useless', label: '無測無用', component: UseLess },
  { path: 'web-vr', hidden: true, component: WebVR },
  { path: 'reasonml', label: 'ReScript', component: ReScript },
  { path: 'web-gl', hidden: true, component: WebGL },
  { path: 'ffxiv-strat', label: 'FFXIV Strat', component: FFXIVStrat },
]

class Playground extends Component {
  static defaultProps = {
    className: ''
  }

  render() {
    const { id, className, match } = this.props
    const classes = cx(styles.className, 'caasih-playground-list', className)

    return (
      <div id={id} className={classes}>
        <Helmet>
          <title>playground - caasih.net</title>
        </Helmet>
        <Switch>
          {routes.map(({ path, component: C }) =>
            <Route key={path} path={`${match.url}/${path}`}>
              <C />
            </Route>
          )}
        </Switch>
        <List className={styles.list} label="playground">
          {routes.filter(r => !r.hidden).map(({ path, label }) =>
            <Link key={path} to={`${match.url}/${path}`}>{label}</Link>
          )}
        </List>
      </div>
    )
  }
}

export default withRouter(Playground)
