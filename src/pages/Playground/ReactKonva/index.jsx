import React, { Component, PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { Stage, Layer, Group, Rect, Text } from 'react-konva'
import Article from 'components/Article'
import CreativeCommons from 'components/CreativeCommons'

import styles from './index.css'



function TextAndRect() {
  return (
    <Stage className={styles.stage} width={200} height={100}>
      <Layer>
        <Rect width={30} height={30} fill="red" />
        <Text fontSize={64} text="oops!" />
      </Layer>
    </Stage>
  )
}

class TextInRect extends PureComponent {
  padding = {
    vertical: 16,
    horizontal: 8,
  }
  textNode = null

  constructor(props) {
    super(props)
    this.state = { w: 0, h: 0 }
  }

  updateDimension() {
    if (!this.textNode) return

    const w = this.textNode.getWidth()
    const h = this.textNode.getHeight()

    this.setState({ w, h })
  }

  componentDidMount() {
    this.updateDimension()
  }

  componentDidUpdate() {
    this.updateDimension()
  }

  render() {
    const { w, h } = this.state
    const width = w + 2 * this.padding.vertical
    const height = h + 2 * this.padding.horizontal

    return (
      <Stage className={styles.stage} width={width + 1} height={height + 1}>
        <Layer>
          <Rect
            width={width}
            height={height}
            fill="red"
            cornerRadius={6}
          />
          <Text
            ref={node => this.textNode = node}
            x={this.padding.vertical}
            y={this.padding.horizontal}
            fontSize={32}
            text="much better"
          />
        </Layer>
      </Stage>
    )
  }
}

class Tag extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    fontSize: PropTypes.number,
    text: PropTypes.string,
    color: PropTypes.string,
    backgroundColor: PropTypes.string,
    onResize: PropTypes.func,
  }

  static defaultProps = {
    className: '',
    x: 0,
    y: 0,
    fontSize: 12,
    color: 'white',
    backgroundColor: 'black',
  }

  styles = {
    cornerRadius: 6,
    padding: {
      top: 6,
      right: 8,
      bottom: 6,
      left: 8,
    }
  }

  textNode = null

  constructor(props) {
    super(props)
    this.state = { w: 0, h: 0 }
  }

  updateDimension() {
    if (!this.textNode) return

    const w = this.textNode.getWidth()
    const h = this.textNode.getHeight()

    this.setState({ w, h })

    const { onResize } = this.props
    if (onResize) {
      const { padding } = this.styles
      const width = w + padding.left + padding.right
      const height = h + padding.top + padding.bottom
      onResize(width, height)
    }
  }

  componentDidMount() {
    this.updateDimension()
  }

  componentDidUpdate(prevProps) {
    if (this.props.text !== prevProps.text) {
      this.updateDimension()
    }
  }

  render() {
    const { cornerRadius, padding } = this.styles
    const { x, y, fontSize, text, color, backgroundColor } = this.props
    const { w, h } = this.state
    const width = w + padding.left + padding.right
    const height = h + padding.top + padding.bottom

    return (
      <Group x={x} y={y}>
        <Rect
          width={width}
          height={height}
          fill={backgroundColor}
          cornerRadius={cornerRadius}
        />
        <Text
          ref={node => this.textNode = node}
          x={padding.left}
          y={padding.top}
          fontSize={fontSize}
          fill={color}
          text={text}
        />
      </Group>
    )
  }
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
        <TextAndRect />
        <p>
          也就是說，當你想畫個剛好可以容納文字的容器（就叫他 <code>Tag</code> 吧）時，得先把文字畫好，得到其寬高，再決定外框該怎麼畫。沒有什麼文字自己把外框「撐開」這種事。如果想達成此效果，只能等 component render 完畢後，取得文字佔據的長寬，再更新外框。
        </p>
        <TextInRect />
        <p>
          如果今天我希望一列這樣的 <code>Tag</code> ，可以自動抓好彼此間的寬度與間距，該怎麼辦？
          React 16 的 <code>ref</code> 雖然能被<a href="https://reactjs.org/docs/refs-and-the-dom.html#exposing-dom-refs-to-parent-components" title="Exposing DOM Refs to Parent Components">暴露給上層的父組件</a>，但沒辦法讓我們自訂它是什麼，也就無法傳遞我們計算過的寬高。為了讓父組件知道子組件的寬高變化，得另外提供個 callback function ，就叫它 <code>onResize</code> 吧。
        </p>
        <Stage className={styles.stage} width={300} height={100}>
          <Layer>
            <Tag text="a tag" />
          </Layer>
        </Stage>
        <p>（待續）</p>
        <CreativeCommons size="compact" type="by" />
      </Article>
    )
  }
}




export default ReactKonva
