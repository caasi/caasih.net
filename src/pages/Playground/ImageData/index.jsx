import React, { useState, useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import Article from 'components/Article'
import ImageDataCanvas from 'components/ImageDataCanvas'
import SourceCode from 'components/SourceCode'
import CreativeCommons from 'components/CreativeCommons'
import { useImageData } from 'types/hooks'
import useImageDataSource from '!raw-loader!types/hooks/use-image-data'
import System from './System'
import SystemSource from '!raw-loader!./System'
import styles from './index.css'

function cloneImageData(imageData) {
  const ByteArray = 'Uint8ClampedArray' in window ? Uint8ClampedArray : Uint8Array;
  const data = new ByteArray(imageData.data)
  return new ImageData(data, imageData.width, imageData.height)
}

function AboutUseImageData({ id, className }) {
  const classes = cx('playground-use-image-data', className)
  const imageData = useImageData('https://farm8.staticflickr.com/7166/6595168855_5566d615d9_b.jpg')
  const [r, setR] = useState('1.0')
  const [g, setG] = useState('1.0')
  const [b, setB] = useState('1.0')
  let numR = +r
  if (isNaN(numR) || numR < 0 || 1.0 < numR) {
    numR = 1.0
  }
  let numG = +g
  if (isNaN(numG) || numG < 0 || 1.0 < numG) {
    numG = 1.0
  }
  let numB = +b
  if (isNaN(numB) || numB < 0 || 1.0 < numB) {
    numB = 1.0
  }
  const processed = useMemo(() => {
    if (!imageData) return imageData
    const cloned = cloneImageData(imageData)
    const { data } = cloned
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = data[i]     * numR
      data[i + 1] = data[i + 1] * numG
      data[i + 2] = data[i + 2] * numB
    }
    return cloned
  }, [imageData, numR, numG, numB])
  const { width = 0 } = processed || {}

  return (
    <Article id={id} className={classes}>
      <Helmet title="ImageData - caasih.net" />
      <h1>ImageData</h1>
      <p>把一個 React Hook 搬到這裡，它叫 <code>useImageData</code> 。</p>
      <div
        className={styles.image}
        style={{ display: width ? 'block' : 'none' }}
      >
        <ImageDataCanvas
          imageData={processed}
          role="img"
          aria-label="20111227 nigel"
          style={{ width: '100%' }}
        />
        <section className={styles.control}>
          <div>
            R&nbsp;
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.01"
              value={r}
              onChange={e => setR(e.target.value)}
            />
          </div>
          <div>
            G&nbsp;
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.01"
              value={g}
              onChange={e => setG(e.target.value)}
            />
          </div>
          <div>
            B&nbsp;
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.01"
              value={b}
              onChange={e => setB(e.target.value)}
            />
          </div>
        </section>
      </div>
      <div className={styles.source}>
        <a href="https://www.flickr.com/photos/84175980@N00/6595168855">"20111227 nigel"</a> by <a href="https://www.flickr.com/photos/84175980@N00">schizoform</a> is licensed under <a href="https://creativecommons.org/licenses/by/2.0"> CC BY 2.0 </a>
      </div>
      <SourceCode open language="jsx">
        {useImageDataSource}
      </SourceCode>
      <p>
        也許有些人看了這些會覺得我不懂 React，在那邊嘴什麼奇怪的東西..。其實你們要說的那些我是知道的，而且大家介紹的也夠多了，我想從一個異於平常的角度，重新再來看待 React Hooks，希望給大家一個平常沒有想到的啟發。
      </p>
      <p>
        把 React 的 render function 看成 reentrant function ，那就可以將 React Hooks
        看成某種包含資料依賴關係的 trait/type class 。裡面放什麼則看你怎麼組合 <code>useState</code>, <code>useEffect</code> 與 <code>useCallback</code> 等 Hooks 。
      </p>
      <p>
        不管它放的是什麼， CPS 變換會在 rerender 時完成，於是用的人拿到的是包裹的值，而不是時間上或空間上的容器。
      </p>
      <p>
        CPS 變換這裡就不贅述，從 2011 開始寫 js 的大家肯定是知道的。
      </p>
      <p>
        但我記得 ECMAScript 沒打算做 deep generator ，不知道未來 React Hooks
        會怎麼走？像之前被 iCook 面試時，前端大大提到的那樣，靠 babel transpile 嗎？
      </p>
      <p>
        後來找半天沒找到 ES Discuss 上關於 coroutine 的討論，但發現 the Little Calculist
        2011 年曾寫過 <a href="http://calculist.org/blog/2011/12/14/why-coroutines-wont-work-on-the-web/">
        Why coroutines won’t work on the web</a> ，解釋為何 JS 不太可能有 coroutine 。
      </p>
      <hr/>
      <p>同理，善用 <code>requestAnimationFrame</code> 與 React Hook ，也可以拚出各種按時間變化的值。</p>
      <System />
      <SourceCode open language="jsx">
        {SystemSource}
      </SourceCode>
      <hr/>
      <p>EDIT: 補上朋友建議的挑釁段落 XD</p>
      <CreativeCommons size="compact" type="by" />
    </Article>
  )
}

export default AboutUseImageData
