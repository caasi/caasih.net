import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { Stage, Layer, Rect, Text } from 'react-konva'
import Article from 'components/Article'
import CreativeCommons from 'components/CreativeCommons'



function TextAndRect() {
  return (
    <Stage width={200} height={100}>
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
      <Stage width={width + 1} height={height + 1}>
        <Layer>
          <Rect
            width={width}
            height={height}
            fill="red"
            cornerRadius={12}
          />
          <Text
            ref={node => this.textNode = node}
            x={this.padding.vertical}
            y={this.padding.horizontal}
            fontSize={64}
            fill="white"
            text="much better"
          />
        </Layer>
      </Stage>
    )
  }
}

class ReactKonva extends PureComponent {
  static propTypes = {
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  render() {
    const { id, className } = this.props
    const classes = cx('playground-react-konva', className)

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
        <p>
          也就是說，當你想畫個剛好可以容納文字的容器（就叫他 <code>Tag</code> 吧）時，得先把文字畫好，得到其寬高，再決定外框該怎麼畫。沒有什麼文字自己把外框「撐開」這種事。
        </p>
        <TextAndRect />
        <p>
          如果想達成此效果，只能等 component render 完畢後，取得文字佔據的長寬，再更新外框。
        </p>
        <TextInRect />
        <p>
          如果今天我希望一列這樣的 <code>Tag</code> 可以抓好寬度與間距，自動排好，該怎麼做呢？
        </p>
        <p>（待續）</p>
        <CreativeCommons size="compact" type="by" />
      </Article>
    )
  }
}




export default ReactKonva
