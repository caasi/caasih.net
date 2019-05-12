import React, { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import Article from 'components/Article'
import ImageDataCanvas from 'components/ImageDataCanvas'
import SourceCode from 'components/SourceCode'
import CreativeCommons from 'components/CreativeCommons'
import useTimeArray from './use-time-array'
import useTimeArraySource from '!raw-loader!./use-time-array'
import { useSpace } from '@caasi/hooks'
import useSpaceSource from '!raw-loader!./use-space'

function AboutUseLess({ id, className }) {
  const classes = cx('playground-useless', className)
  const [input, setInput] = useState('abc')
  const xs = useMemo(() => input.split(''), [input])
  const x = useTimeArray(xs)
  const [xss = [], reset] = useSpace(x)

  return (
    <Article id={id} className={classes}>
      <Helmet title="無測無用 - caasih.net" />
      <h1>無測無用</h1>
      <h2><code>useLess</code></h2>
      <p>當應用程式狀態更新時， <code>useState</code> hook 讓我們可以無視時間，拿到最新的值，好像我們一開始看到的就是最後的值一樣。</p>
      <p>換個角度看，也可以說 <code>useState</code> 幫我們把值攤到時間上了，例如我們可以寫一個 <code>useTimeArray</code> ，把陣列中的值變成一系列更新：</p>
      <SourceCode open language="js">
        {useTimeArraySource}
      </SourceCode>
      <p>
        xs:
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
      <hr />
      <p>但既然能利用更新把值攤到時間上，能不能反過來把時間上的變化，攤回空間上呢？</p>
      <p>於是我們可以設計一個 <code>useSpace</code> hook ：</p>
      <SourceCode open language="js">
        {useSpaceSource}
      </SourceCode>
      <p>它做的事很簡單，當傳進來的 state 變化時，就把它存到記錄下來的 state list 尾端。</p>
      <p>於是我們又把 <code>{x}</code> 變回了 <code>[{xss.join(', ')}]</code> 。</p>
      <p>修改上面的 <code>xs</code> ，可以發現這樣操作並不穩定，當 <code>xs</code> 更新後， <code>useSpace</code> 有機會忽略第一個值。 <code>useTimeArray</code> 一開始還會多給一個 <code>undefined</code> 。</p>
      <p>而且目前的 <a href="https://github.com/mpeyper/react-hooks-testing-library/"><code>react-hooks-testing-library</code></a> ，並不能測試 <code>useSpace</code> 。</p>
      <hr />
      <p>這 hook 可以做什麼呢？目前想到的用途有：</p>
      <ol>
        <li>一次呈現每次 component update 的結果，方便除錯、</li>
        <li>事件處理，將多次發生的事件結果放在 array 中、</li>
        <li>把 <code>Array::map</code> 從 jsx 中變不見。</li>
      </ol>
      <hr />
      <p>感謝朋友在閒聊時，提供標題 XD</p>
      <CreativeCommons size="compact" type="by" />
    </Article>
  )
}

export default AboutUseLess
