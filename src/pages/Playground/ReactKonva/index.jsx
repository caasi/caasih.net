import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { Stage, Layer } from 'react-konva'
import Article from 'components/Article'
import SourceCode from 'components/SourceCode'
import CreativeCommons from 'components/CreativeCommons'
import TextAndRectSource from '!raw-loader!./TextAndRect'
import TextAndRect from './TextAndRect'
import TextInRectSource from '!raw-loader!./TextInRect'
import TextInRect from './TextInRect'
import TagSource from '!raw-loader!./Tag'
import Tag from './Tag'
import TagListSource from '!raw-loader!./TagList'
import TagList from './TagList'
import TagListRecSource from '!raw-loader!./TagListRec'
import TagListRec from './TagListRec'
import styles from './index.css'

function MyStage({ children }) {
  return (
    <Stage className={styles.stage} width={210} height={80}>
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
          React Konva 將 Canvas 繪圖函式庫 Konva.js 包裝成 React components 。
          Konva.js 則將 Canvas 操作包裝好，提供容器（例如 <code>Group</code> ）將形狀們包裝起來，方便位移、旋轉。
        </p>
        <p>
          乍看很美好，但 Konva.js 不提供像 HTML 或 SVG 那樣的排版功能。
        </p>
        <figure>
          <MyStage>
            <TextAndRect />
          </MyStage>
          <figcaption>
            <code>Rect</code> 和 <code>Text</code> 彼此無關
          </figcaption>
        </figure>
        <SourceCode language="jsx">
          {TextAndRectSource}
        </SourceCode>
        <p>
          也就是說，當你想畫個剛好可以容納文字的容器（就叫他 <code>Tag</code> 吧）時，得先把文字畫好，得到其寬高，再決定外框該怎麼畫。沒有什麼文字自己把外框「撐開」這種事。如果想達成此效果，只能等 component render 完，取得文字佔據的長寬，再更新外框。
        </p>
        <figure>
          <MyStage>
            <TextInRect />
          </MyStage>
          <figcaption>
            <code>Text</code> 畫完後，再根據其長寬畫外框
          </figcaption>
        </figure>
        <SourceCode language="jsx">
          {TextInRectSource}
        </SourceCode>
        <p>
          如果今天希望一列這樣的 <code>Tag</code> ，可以自動抓好彼此間的寬度與間距，該怎麼辦？
          React 16 的 <code>ref</code> 雖然能被<a href="https://reactjs.org/docs/refs-and-the-dom.html#exposing-dom-refs-to-parent-components" title="Exposing DOM Refs to Parent Components">暴露給上層的父組件</a>，但沒辦法讓我們自訂它是什麼，也就無法傳遞我們計算過的寬高。為了讓父組件知道子組件的寬高變化，得另外提供個 callback function ，就叫它 <code>onResize</code> 吧。
        </p>
        <figure>
          <MyStage>
            <Tag text="a tag" />
          </MyStage>
          <figcaption>
            一個 <code>Tag</code> 長這樣
          </figcaption>
        </figure>
        <SourceCode language="jsx" label="Tag.jsx">
          {TagSource}
        </SourceCode>
        <p>接著準備一個容器 <code>TagList</code> ，他會記下子組件送來的寬度，好重新排版。將子組件當成 <code>children</code> 傳遞給它時，不用提供 <code>onResize</code> ，由 <code>TagList</code> 自己以 <code>cloneElement</code> 插入。</p>
        <figure>
          <MyStage>
            <TagList>
              <Tag text="this" />
              <Tag text="is" />
              <Tag text="my" />
              <Tag text="tags" />
            </TagList>
          </MyStage>
          <figcaption>
            以迴圈實作的 <code>TagList</code>
          </figcaption>
        </figure>
        <SourceCode language="jsx" label="TagList.jsx">
          {TagListSource}
        </SourceCode>
        <p>也可以遞迴實作這個 <code>TagList</code> 。</p>
        <figure>
          <MyStage>
            <TagListRec>
              <Tag text="這是" />
              <Tag text="一堆" />
              <Tag text="標籤" />
            </TagListRec>
          </MyStage>
          <figcaption>
            遞迴實作的 <code>TagList</code>
          </figcaption>
        </figure>
        <SourceCode language="jsx" label="TagListRec.jsx">
          {TagListRecSource}
        </SourceCode>
        <p>
          反過來說，可以先決定容器的寬度，再不斷修改內容物，直到所有子組件都能塞到容器內。
        </p>
        <CreativeCommons size="compact" type="by" />
      </Article>
    )
  }
}

export default ReactKonva
