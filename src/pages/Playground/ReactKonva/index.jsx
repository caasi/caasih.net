import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { Stage, Layer } from 'react-konva'
import SyntaxHighlighter from 'react-syntax-highlighter'
import Article from 'components/Article'
import CreativeCommons from 'components/CreativeCommons'
import TextAndRectSource from 'raw-loader!./TextAndRect'
import TextAndRect from './TextAndRect'
import TextInRect from './TextInRect'
import Tag from './Tag'

import styles from './index.css'



function MyStage({ children }) {
  return (
    <Stage className={styles.stage} width={300} height={100}>
      <Layer>{children}</Layer>
    </Stage>
  )
}

class ReactKonva extends Component {
  static propTypes = {
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  render() {
    const { id, className } = this.props
    const classes = cx(styles.className, 'playground-react-konva', className)

    return (
      <Article id={id} className={classes}>
        <h1>React Konva</h1>
        <p>
          React Konva 這個函式庫將 Canvas 繪圖函式庫 Konva.js 包裝成 React component 。
          Konva.js 將 Canvas 操作包裝好，還提供容器（例如 <code>Group</code> ）將形狀們包裝起來，方便位移、旋轉。
        </p>
        <p>
          乍看很美好，但 Konva.js 不提供像 HTML 或 SVG 那樣神奇的 layout 功能。
        </p>
        <SyntaxHighlighter language="javascript">
          {TextAndRectSource}
        </SyntaxHighlighter>
        <MyStage>
          <TextAndRect />
        </MyStage>
        <p>
          也就是說，當你想畫個剛好可以容納文字的容器（就叫他 <code>Tag</code> 吧）時，得先把文字畫好，得到其寬高，再決定外框該怎麼畫。沒有什麼文字自己把外框「撐開」這種事。如果想達成此效果，只能等 component render 完畢後，取得文字佔據的長寬，再更新外框。
        </p>
        <MyStage>
          <TextInRect />
        </MyStage>
        <p>
          如果今天我希望一列這樣的 <code>Tag</code> ，可以自動抓好彼此間的寬度與間距，該怎麼辦？
          React 16 的 <code>ref</code> 雖然能被<a href="https://reactjs.org/docs/refs-and-the-dom.html#exposing-dom-refs-to-parent-components" title="Exposing DOM Refs to Parent Components">暴露給上層的父組件</a>，但沒辦法讓我們自訂它是什麼，也就無法傳遞我們計算過的寬高。為了讓父組件知道子組件的寬高變化，得另外提供個 callback function ，就叫它 <code>onResize</code> 吧。
        </p>
        <MyStage>
          <Tag text="a tag" />
        </MyStage>
        <p>（待續）</p>
        <CreativeCommons size="compact" type="by" />
      </Article>
    )
  }
}




export default ReactKonva