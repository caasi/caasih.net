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

class Playground extends Component<Props> {
  static defaultProps = {
    className: ''
  }

  render() {
    const { id, className, match } = this.props
    const classes = cx(styles.className, 'caasih-playground-list', className)
    const paths = {
      'then': `${match.url}/then`,
      'react-konva': `${match.url}/react-konva`,
      'map': `${match.url}/map`,
      'purescript': `${match.url}/purescript`,
      'image-data': `${match.url}/use-image-data`,
    }

    return (
      <div id={id} className={classes}>
        <Helmet>
          <title>playground - caasih.net</title>
        </Helmet>
        <Route path={paths['then']} render={() => <Then />} />
        <Route path={paths['react-konva']} render={() => <ReactKonva />} />
        <Route path={paths['map']} render={() => <Map />} />
        <Route path={paths['purescript']} render={() => <PureScript />} />
        <Route path={paths['image-data']} render={() => <ImageData />} />
        <List className={styles.list} label="playground">
          <Link to={paths['then']}>{'<Then />'}</Link>
          <Link to={paths['react-konva']}>{'React Konva'}</Link>
          <Link to={paths['map']}>{'Map'}</Link>
          <Link to={paths['purescript']}>{'PureScript'}</Link>
          <Link to={paths['image-data']}>{'ImageData'}</Link>
        </List>
      </div>
    )
  }
}

export default withRouter(Playground)
