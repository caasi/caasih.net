/* @flow */

import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import { withRouter, Link, Route } from 'react-router-dom'
import type { ContextRouter } from 'react-router'
import List from 'components/List'
import Then from './Then'
import ReactKonva from './ReactKonva'
import Map from './Map'
import PureScript from './PureScript'
import ImageData from './ImageData'

import styles from './index.css'

type OwnProps = {
  id: string,
  className: string,
}

type Props = ContextRouter & OwnProps

const paths = ['then', 'react-konva', 'map', 'purescript', 'image-data']

class Playground extends Component<Props> {
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
        <Route path={ps['then']} render={() => <Then />} />
        <Route path={ps['react-konva']} render={() => <ReactKonva />} />
        <Route path={ps['map']} render={() => <Map />} />
        <Route path={ps['purescript']} render={() => <PureScript />} />
        <Route path={ps['image-data']} render={() => <ImageData />} />
        <List className={styles.list} label="playground">
          <Link to={ps['then']}>{'<Then />'}</Link>
          <Link to={ps['react-konva']}>{'React Konva'}</Link>
          <Link to={ps['map']}>{'Map'}</Link>
          <Link to={ps['purescript']}>{'PureScript'}</Link>
          <Link to={ps['image-data']}>{'ImageData'}</Link>
        </List>
      </div>
    )
  }
}

export default withRouter(Playground)
