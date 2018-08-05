/* @flow */

import * as React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { Stage, Layer, Rect } from 'react-konva'
import Article from 'components/Article'
import SourceCode from 'components/SourceCode'
import CreativeCommons from 'components/CreativeCommons'

// snippets
import textAndRectSource from '!raw-loader!./TextAndRect'
import componentStructure from '!raw-loader!./examples/0-component.jsx'
import ref from '!raw-loader!./examples/1-ref.jsx'
import handleResize from '!raw-loader!./examples/2-handle-resize.js'
import updateDimension from '!raw-loader!./examples/3-update-dimension.jsx'

import TextAndRect from './TextAndRect'
import TextInRect from './TextInRect'
import TagSource from '!raw-loader!./Tag'
import Tag from './Tag'
import TagListSource from '!raw-loader!./TagList'
import TagList from './TagList'
import TagListRecSource from '!raw-loader!./TagListRec'
import TagListRec from './TagListRec'
import WidthBoundedText from './WidthBoundedText'
import BoundedText from './BoundedText'
import styles from './index.css'

type Props = {
  id?: string,
  className: string,
}

function MyStage({ children }: { children: React.Node }) {
  return (
    <Stage className={styles.stage} width={210} height={80}>
      <Layer>{children}</Layer>
    </Stage>
  )
}

class ReactKonva extends React.Component<Props> {
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
          {textAndRectSource}
        </SourceCode>
        <p>
          可以給 Konva.js <code>Text</code> 特定寬、高，來限制繪製區域。若希望在繪製完後根據文字寬高畫其他元件，則需要多包裝一下。
        </p>
        <p>
          下面提到的元件都以 <a href="https://flow.org/">Flow</a> 標註型別，有著類似結構：
        </p>
        <SourceCode open language="jsx">
          {componentStructure}
        </SourceCode>
        <hr />
        <p>
          為了取得文字寬高，得用上 <a href="https://reactjs.org/docs/refs-and-the-dom.html"><code>ref</code></a> 來存取 React 包裝起來的繪製結果。平常取得的 <code>ref</code> 是 DOM node ，在 React Konva 下，我們拿到的是 <a href="https://konvajs.github.io/api/Konva.Text.html"><code>Konva.Text</code></a> 。
        </p>
        <SourceCode open language="jsx">
          {ref}
        </SourceCode>
        <p>
          接著在 <code>componentDidMount</code> 和 <code>componentDidUpdate</code> 時，就可以將長寬回報給父元件。
        </p>
        <SourceCode open language="jsx">
          {handleResize}
        </SourceCode>
        <p>
          當你想畫個剛好可以容納文字的容器時，靠 <code>onResize</code> 取得第一次畫的文字長寬，再畫一次外面的容器即可。因為第二次畫的 <code>Text</code> 長寬不變， <code>onResize</code> 不會再被呼叫一次，不用擔心遞迴呼叫停不下來。
        </p>
        <figure>
          <MyStage>
            <TextInRect />
          </MyStage>
          <figcaption>
            <code>Text</code> 畫完後，再根據其長寬畫外框
          </figcaption>
        </figure>
        <SourceCode open language="jsx">
          {updateDimension}
        </SourceCode>
        <hr />
        <p>
          如果今天希望一列這樣的 <code>Tag</code> ，可以自動抓好彼此間的寬度與間距，該怎麼辦？為了讓父組件知道子組件的寬高變化，可以讓 <code>Tag</code> 也有自己的 <code>onResize</code> ，將寬高傳上去。
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
        <hr />
        <p>
          反過來說，可以先決定容器的寬度，再不斷修改內容物，直到所有子組件都能塞到容器內。
        </p>
        <figure>
          <MyStage>
            <Rect x={1} y={1} width={120} height={10} stroke="#2ecc71" strokeWidth={1} />
            <WidthBoundedText x={0} y={0} width={120}>
              你專業，我信你！
            </WidthBoundedText>
            <Rect x={1} y={21} width={72} height={10} stroke="#2ecc71" strokeWidth={1} />
            <WidthBoundedText x={0} y={20} width={72}>
              你專業，我信你！
            </WidthBoundedText>
            <Rect x={1} y={41} width={50} height={10} stroke="#2ecc71" strokeWidth={1} />
            <WidthBoundedText x={0} y={40} width={50}>
              你專業，我信你！
            </WidthBoundedText>
          </MyStage>
          <figcaption>
            <code>WidthBoundedText</code> 專心把文字畫在指定寬度中
          </figcaption>
        </figure>
        <p>
          有了限制寬度的容器，可以做到文字換行。
        </p>
        <figure>
          <MyStage>
            <BoundedText width={150}>
              中國政協會議定調，Lytro，呂明賜帶中華隊，追憶黃昭堂，基本面強勁，社會萬象，豐濱落海失蹤男童，金酸莓11入圍
            </BoundedText>
          </MyStage>
          <figcaption>
            一行 150px
          </figcaption>
        </figure>
        <CreativeCommons size="compact" type="by" />
      </Article>
    )
  }
}

export default ReactKonva
