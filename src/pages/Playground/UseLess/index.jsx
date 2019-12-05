import React, { useState, useMemo, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import Article from 'components/Article'
import ImageDataCanvas from 'components/ImageDataCanvas'
import SourceCode from 'components/SourceCode'
import CreativeCommons from 'components/CreativeCommons'
import { useArray, useSpace, useWebSocket } from '@caasi/hooks'
import useArraySource from '!raw-loader!./use-array'
import useSpaceSource from '!raw-loader!./use-space'
import useWebSocketPart from '!raw-loader!./use-web-socket.part'
import { colors, styleMap } from './color'
import ColorRect from './ColorRect'
import ColorRectSource from '!raw-loader!./ColorRect'
import SpaceTime from './SpaceTime'
import SpaceTimeSource from '!raw-loader!./SpaceTime'
import SpaceTimeExample from '!raw-loader!./SpaceTime.part'
import List from './List'
import ListSource from '!raw-loader!./List'
import ListExample from '!raw-loader!./List.part'
import styles from './index.css'

const { protocol } = window.location
const echoURL = `${protocol.replace(/^http/, 'ws')}//echo.websocket.org`

function identity(x) {
  return x;
}

function takeFromUndefined(xs = []) {
  return xs.reduce((acc, x) => x === undefined ? [] : [...acc, x], []);
}

function AboutUseLess({ id, className }) {
  const classes = cx(styles.className, 'playground-useless', className)

  // for `useSpace`
  const [input, setInput] = useState('abc')
  const xs = useMemo(() => [undefined].concat(input.split('')), [input])
  const x = useArray(xs)
  const xss = useSpace(x);

  // for `useWebSocket`
  const [message, setMessage] = useState('')
  const [socket, messages = []] = useWebSocket(echoURL)
  const msgs = messages.filter(x => x).reverse()

  // for <SpaceTime />
  const [isMouseDown, setMouseDown] = useState(false)
  const [counter, setCounter] = useState(0)
  const colorElem = useMemo(() =>
    <ColorRect data={{ backgroundColor: colors[counter] }} />
  , [counter]);
  useEffect(() => {
    let id

    const f = () => {
      if (isMouseDown) {
        id = requestAnimationFrame(f)
        setCounter(Math.floor(Math.random() * colors.length))
      }
    }
    id = requestAnimationFrame(f)

    return () => cancelAnimationFrame(id)
  }, [isMouseDown])

  // last example
  const bitmapElem = useMemo(() =>
    <List data={styleMap}>
      <List>
        <ColorRect />
      </List>
    </List>
  , [styleMap])

  return (
    <Article id={id} className={classes}>
      <Helmet title="無測無用 - caasih.net" />
      <h1>無測無用</h1>
      <h2><code>useLess</code></h2>

      <p>當應用程式狀態更新時， <code>useState</code> hook 讓我們無視時間，拿到最新的值，好像我們一開始看到的就是最後的值一樣。</p>
      <p>換個角度看，也可以說 <code>useState</code> 幫我們把值攤到時間上了。例如可以寫一個 <code>useArray</code> ，把陣列中的值變成一系列更新：</p>
      <SourceCode open language="js">
        {useArraySource}
      </SourceCode>
      <p>
        let xs =
        &nbsp;
        <input
          value={input}
          onChange={e => {
            setInput(e.target.value)
          }}
        />
      </p>
      <p>這東西很沒用，當你把 <code>xs = [{xs.filter(identity).join(', ')}]</code> 丟給它，只會看到最後的 <code>{x}</code> 。</p>

      <h3><code>useSpace</code></h3>
      <p>但既然能把值攤到時間上，能不能反過來把時間上的變化，蒐集起來呢？</p>
      <p>可以設計一個 <code>useSpace</code> hook ：</p>
      <SourceCode open language="js">
        {useSpaceSource}
      </SourceCode>
      <p>於是我們又把 <code>{x}</code> 變回了 <code>[{takeFromUndefined(xss).join(', ')}]</code> 。</p>
      <h3><code>useWebSocket</code></h3>
      <p>
        靠 React Hooks 與 event listener 互動時，會遇上：「更新值的 function 得隨著值一起更新，於是得一直 add event listener ，再 remove event listener 」。
      </p>
      <p>
        有了 <code>useSpace</code> ，我們可以：
      </p>
      <SourceCode open language="js">
        {useWebSocketPart}
      </SourceCode>
      <p>於是 <code>handleMessage</code> 不用看到整個 <code>messages</code> 。</p>
      <form className={styles.demo}>
        <p>和 <code>{echoURL}</code> 通訊看看：</p>
        <section>
          <fieldset>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                socket.send(message);
                setMessage('');
              }}
            >
              ↵
            </button>
          </fieldset>
          {
            msgs.length !== 0 &&
            <ol>
            {
              msgs
                .filter(x => x)
                .map((msg, i) => <li key={i}>{msg}</li>)
            }
            </ol>
          }
        </section>
      </form>
      <p>但這個問題完全可以靠傳遞一個 update function 給 <code>setState</code> 解決，無用。</p>

      <h3><code>&lt;SpaceTime /&gt;</code></h3>
      <p>我們還可以做出這樣的 component ：</p>
      <SourceCode open language="jsx">
        {SpaceTimeSource}
      </SourceCode>
      <p><code>&lt;SpaceTime /&gt;</code> 展開過去繪製過的 children ，於是這樣寫：</p>
      <SourceCode open language="jsx">
        {ColorRectSource}
      </SourceCode>
      <SourceCode open language="jsx">
        {SpaceTimeExample}
      </SourceCode>
      <p>就能達成下面的效果：</p>
      <div className={styles.demo}>
        <p>點下面的方塊：</p>
        <div
          className={styles.currentRect}
          onMouseDown={() => setMouseDown(true)}
          onMouseUp={() => setMouseDown(false)}
          onMouseLeave={() => setMouseDown(false)}
        >
          {colorElem}
        </div>
        <div className={styles.previousRects}>
          <SpaceTime>
            {colorElem}
          </SpaceTime>
        </div>
      </div>
      <p>但這也可以靠 <code>useState</code> 做到，無用。😂</p>

      <h3><code>map</code></h3>
      <p>既然我們可以把值攤到時間上再組合回來，就可以把 <code>Array::map</code> 藏起來：</p>
      <SourceCode open language="jsx">
        {ListSource}
      </SourceCode>
      <p>再一口氣畫完一張圖：</p>
      <SourceCode open language="jsx">
        {ListExample}
      </SourceCode>
      <div className={styles.demo}>
        {bitmapElem}
      </div>
      <p>超無用！❤️</p>

      <h3>更多無用</h3>
      <ul>
        <li>因為新版的 <code>useSpace</code> 沒辦法 reset ，所以偷偷使用 <code>undefined</code> 當成分隔符號。</li>
        <li>要是連續兩個值完全一樣，會被 <code>useArray</code> 忽略。</li>
          <li>這些 custom hooks 很難測試，只好靠 E2E test 工具 <a href="https://www.cypress.io/"><code>cypress</code></a> 來測。</li>
      </ul>
      <p>感謝朋友在閒聊時，提供標題 XD</p>

      <CreativeCommons size="compact" type="by" />
    </Article>
  )
}

export default AboutUseLess
