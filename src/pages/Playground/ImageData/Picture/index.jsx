import React, { useState, useCallback, useMemo } from 'react'
import ImageDataCanvas from 'components/ImageDataCanvas'
import { useImageData, useInput } from '@caasi/hooks'
import styles from './index.css'

function cloneImageData(imageData) {
  const ByteArray = 'Uint8ClampedArray' in window ? Uint8ClampedArray : Uint8Array;
  const data = new ByteArray(imageData.data)
  return new ImageData(data, imageData.width, imageData.height)
}

function Picture({ id }) {
  const imageData = useImageData('https://farm8.staticflickr.com/7166/6595168855_5566d615d9_b.jpg')
  const [r, rRange] = useInput(
    <input type="range" min="0.0" max="1.0" step="0.01" />,
    '1.0'
  )
  const [g, gRange] = useInput(
    <input type="range" min="0.0" max="1.0" step="0.01" />,
    '1.0'
  )
  const [b, bRange] = useInput(
    <input type="range" min="0.0" max="1.0" step="0.01" />,
    '1.0'
  )
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
    <div id={id} style={{ display: width ? 'block' : 'none' }}>
      <div className={styles.image}>
        <ImageDataCanvas
          imageData={processed}
          role="img"
          aria-label="20111227 nigel"
          style={{ width: '100%' }}
        />
        <section className={styles.control}>
          <div>R {rRange}</div>
          <div>G {gRange}</div>
          <div>B {bRange}</div>
        </section>
      </div>
      <div className={styles.source}>
        <a href="https://www.flickr.com/photos/84175980@N00/6595168855">"20111227 nigel"</a> by <a href="https://www.flickr.com/photos/84175980@N00">schizoform</a> is licensed under <a href="https://creativecommons.org/licenses/by/2.0"> CC BY 2.0 </a>
      </div>
    </div>
  )
}

export default Picture;
