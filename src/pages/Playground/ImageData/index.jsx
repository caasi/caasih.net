import React, { useState, useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import Article from 'components/Article'
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
  const { width = 0, height = 0 } = processed || {}

  const canvasRef = useCallback(node => {
    if (node && processed) {
      const ctx = node.getContext('2d')
      ctx.putImageData(processed, 0, 0)
    }
  }, [processed])

  return (
    <Article id={id} className={classes}>
      <Helmet title="ImageData - caasih.net" />
      <h1>ImageData</h1>
      <p>把一個 hook 搬到這裡，它叫 <code>useImageData</code> 。</p>
      <div
        className={styles.image}
        style={{ display: width ? 'block' : 'none' }}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="20111227 nigel"
          width={width}
          height={height}
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
        把 React 的 render function 看成 reentrant function ，那就可以將 React hooks
        看成某種包含資料依賴關係的 trait/type class 。裡面放什麼則看你怎麼組合 <code>useState</code>, <code>useEffect</code> 與 <code>useCallback</code> 等 hooks 。
      </p>
      <p>
        不管它放的是什麼， CPS 變換會在 rerender 時完成，於是用的人拿到的是包裹的值，而不是時間上或空間上的容器。
      </p>
      <p>
        但我記得 ECMAScript 沒打算做 deep generator ，不知道未來 React hooks
        會怎麼走？像之前被 iCook 面試時，前端大大提到的那樣，靠 babel transpile 嗎？
      </p>
      <p>
        後來找半天沒找到 ES Discuss 上關於 coroutine 的討論，但發現 the Little Calculist
        2011 年曾寫過 <a href="http://calculist.org/blog/2011/12/14/why-coroutines-wont-work-on-the-web/">
        Why coroutines won’t work on the web</a> ，解釋為何 JS 不太可能有 coroutine 。
      </p>
      <hr/>
      <p>同理，善用 <code>requestAnimationFrame</code> 與 React hook ，也可以拚出各種按時間變化的值。</p>
      <System />
      <SourceCode open language="jsx">
        {SystemSource}
      </SourceCode>
    </Article>
  )
}

export default AboutUseImageData
