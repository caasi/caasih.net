import React, { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import Article from 'components/Article'
import ImageDataCanvas from 'components/ImageDataCanvas'
import SourceCode from 'components/SourceCode'
import CreativeCommons from 'components/CreativeCommons'
import useTimeArray from './use-time-array'
import useTimeArraySource from '!raw-loader!./use-time-array'
import { useSpace, useWebSocket } from '@caasi/hooks'
import useSpaceSource from '!raw-loader!./use-space'
import useWebSocketPart from '!raw-loader!./use-web-socket.part'
import SpaceTime from './SpaceTime'
import SpaceTimeSource from '!raw-loader!./SpaceTime'
import SpaceTimeExample from '!raw-loader!./SpaceTime.part'
import styles from './index.css'

const { protocol } = window.location;
const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
const echoURL = `${wsProtocol}//echo.websocket.org`;
const flatColors = [
  '#1abc9c',
  '#2ecc71',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#f1c40f',
  '#e67e22',
  '#e74c3c',
  '#ecf0f1',
  '#95a5a6',
]

function ColorRect({ color }) {
  return (
    <div className={styles.colorRect} style={{ backgroundColor: color }} />
  );
}

function AboutUseLess({ id, className }) {
  const classes = cx(styles.className, 'playground-useless', className)
  // for `useSpace`
  const [input, setInput] = useState('abc')
  const xs = useMemo(() => input.split(''), [input])
  const x = useTimeArray(xs)
  const [xss = [], reset] = useSpace(x)
  // for `useWebSocket`
  const [message, setMessage] = useState('');
  const [socket, messages = []] = useWebSocket(echoURL);
  const msgs = messages.filter(x => x).reverse();
  const [counter, setCounter] = useState(0)
  const colorIdx = counter % flatColors.length
  const colorElem = useMemo(() =>
    <ColorRect color={flatColors[colorIdx]} />
  , [colorIdx]);

  return (
    <Article id={id} className={classes}>
      <Helmet title="無測無用 - caasih.net" />
      <h1>無測無用</h1>
      <h2><code>useLess</code></h2>

      <p>當應用程式狀態更新時， <code>useState</code> hook 讓我們無視時間，拿到最新的值，好像我們一開始看到的就是最後的值一樣。</p>
      <p>換個角度看，也可以說 <code>useState</code> 幫我們把值攤到時間上了，例如可以寫一個 <code>useTimeArray</code> ，把陣列中的值變成一系列更新：</p>
      <SourceCode open language="js">
        {useTimeArraySource}
      </SourceCode>
      <p>
        let xs =
        &nbsp;
        <input
          value={input}
          onChange={e => {
            reset([])
            setInput(e.target.value)
          }}
        />
      </p>
      <p>這東西看起來很沒用，當你把 <code>xs = [{xs.join(', ')}]</code> 丟給它，只會看到最後的 <code>{x}</code> 。</p>

      <h3><code>useSpace</code></h3>
      <p>但既然能利用更新把值攤到時間上，能不能反過來把時間上的變化，攤回空間上呢？</p>
      <p>我們可以設計一個 <code>useSpace</code> hook ：</p>
      <SourceCode open language="js">
        {useSpaceSource}
      </SourceCode>
      <p>它做的事很簡單，當傳進來的 state 變化時，就把它存到記錄下來的 state list 尾端。</p>
      <p>於是我們又把 <code>{x}</code> 變回了 <code>[{xss.join(', ')}]</code> 。</p>
      <h3><code>useWebSocket</code></h3>
      <p>
        靠 React Hooks 處理 event listener 時，會遇上：「更新值的 function 得隨著值一起更新，於是得一直 add event listener ，再 remove event listener 」。
      </p>
      <p>
        有了 <code>useSpace</code> ，我們可以：
      </p>
      <SourceCode open language="js">
        {useWebSocketPart}
      </SourceCode>
      <p>於是 <code>handleMessage</code> 只需要關心 <code>setMessage</code> 即可 XD</p>
      <form className={styles.demo}>
        <p>和 echo service: <code>{echoURL}</code> 通訊看看：</p>
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
      <p>但這個問題完全可以靠傳遞一個 update function 給 <code>setState</code> 解決， <code>useSpace</code> 仍然沒用。</p>

      <h3><code>&lt;SpaceTime /&gt;</code></h3>
      <p>我們還可以做出這樣的 component ：</p>
      <SourceCode open language="js">
        {SpaceTimeSource}
      </SourceCode>
      <p><code>&lt;SpaceTime /&gt;</code> 會幫我們展開過去繪製過的 children ，於是這樣寫：</p>
      <SourceCode open language="js">
        {SpaceTimeExample}
      </SourceCode>
      <p>就能達成下面的效果。</p>
      <div className={styles.demo}>
        <p>點下面的方塊：</p>
        <div
          className={styles.currentRect}
          onClick={() => setCounter(c => c+1)}
        >
          {colorElem}
        </div>
        <div className={styles.previousRects}>
          <SpaceTime>
            {colorElem}
          </SpaceTime>
        </div>
      </div>
      <p>但這也可以靠 <code>useState</code> 再 <code>map</code> 做到😂</p>

      <h3><code>fmap</code></h3>

      <h3>更多無用的細節</h3>
      <p>目前的 <a href="https://github.com/mpeyper/react-hooks-testing-library/"><code>react-hooks-testing-library</code></a> ，並不能測試 <code>useSpace</code> 。</p>
      <hr />
      <p>感謝朋友在閒聊時，提供標題 XD</p>

      <CreativeCommons size="compact" type="by" />
    </Article>
  )
}

export default AboutUseLess
