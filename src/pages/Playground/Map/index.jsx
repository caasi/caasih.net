/* @flow */

import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import Article from 'components/Article'
import SourceCode from 'components/SourceCode'
import CreativeCommons from 'components/CreativeCommons'
import MinimumMap from './MinimumMap'

type Props = {
  id?: string,
  className: string,
}

class Map extends Component<Props> {
  static defaultProps = {
    className: '',
  }

  render() {
    const { id, className } = this.props
    const classes = cx('playground-map', className)

    return (
      <Article id={id} className={classes}>
        <Helmet>
          <title>Map - caasih.net</title>
        </Helmet>
        <h1>Map</h1>
        <p>這裡比較像素描簿而不是遊樂場，堆著各種沒做完的草稿。</p>
        <MinimumMap />
        <p>這是一個簡單的地圖，靠 React 16 的 context API ，可以不用 Redux 管理 global state 。</p>
        <CreativeCommons size="compact" type="by" />
      </Article>
    )
  }
}

export default Map
