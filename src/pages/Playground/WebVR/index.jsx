import React, { useMemo, useState, useEffect } from 'react'
import cx from 'classnames'
import { Helmet } from 'react-helmet'
import Article from 'components/Article'
import { usePromise } from '@caasi/hooks'
import styles from './index.css'

import WebVRPolyfill from 'webvr-polyfill'
new WebVRPolyfill()

function getVRDisplays() {
  if (!('getVRDisplays' in navigator)) {
    return Promise.reject('WebVR not supported')
  }
  return navigator.getVRDisplays()
}

const emptyFrameData = new VRFrameData()

function useVRDisplay(display) {
  const [frameData, setFrameData] = useState(emptyFrameData)

  useEffect(() => {
    let id

    const update = () => {
      const fd = new VRFrameData()
      display.getFrameData(fd)
      setFrameData(fd)
      id = display.requestAnimationFrame(update)
    }
    id = display.requestAnimationFrame(update)

    return () => {
      if (!id) return
      display.clearAnimationFrame(id)
      id = undefined
    }
  }, [display])

  return frameData
}

function keys(data = {}) {
  let keys = [];
  for (let k in data) {
    if (!k.length || k[0] === '_' || k[k.length - 1] === '_') continue
    if (typeof data[k] === 'function') continue
    keys.push(k)
  }
  return keys
}

function Matrix({
  as: Component = 'code',
  data,
}) {
  if (data.length === 4) {
    return (
      <Component>
        [ {data[0].toFixed(3)}, {data[1].toFixed(3)}<br/>
        , {data[2].toFixed(3)}, {data[3].toFixed(3)}<br/>
        ]
      </Component>
    )
  }

  if (data.length === 16) {
    return (
      <Component>
        [ {data[0].toFixed(3)}, {data[1].toFixed(3)}, {data[2].toFixed(3)}, {data[3].toFixed(3)}<br/>
        , {data[4].toFixed(3)}, {data[5].toFixed(3)}, {data[6].toFixed(3)}, {data[7].toFixed(3)}<br/>
        , {data[8].toFixed(3)}, {data[9].toFixed(3)}, {data[10].toFixed(3)}, {data[11].toFixed(3)}<br/>
        , {data[12].toFixed(3)}, {data[13].toFixed(3)}, {data[14].toFixed(3)}, {data[15].toFixed(3)}<br/>
        ]
      </Component>
    )
  }

  return (
    <Component>[array({data.length})]</Component>
  )
}

function ObjectMember({
  as: Component = 'div',
  name = '',
  data = null,
  depth = 5,
}) {
  if (depth <= 0) return null
  return (
    <Component>
      <b>{name}</b>:&nbsp;
      {
        data === null ?
          <code>null</code> :
        data === undefined ?
          <code>undefined</code> :
        data === true ?
          <code>true</code> :
        data === false ?
          <code>false</code> :
        data instanceof Float32Array ?
          <div><Matrix data={data} /></div> :
        typeof data === 'number' && data !== (data|0) ?
          data.toFixed(3) :
        typeof data === 'object' ?
          <ul>
          {keys(data).map(k =>
            <ObjectMember
              as="li"
              key={k}
              name={k}
              data={data[k]}
              depth={depth - 1}
            />
          )}
          </ul> :
          <i>{data}</i>
      }
    </Component>
  )
}

function FrameData({
  as: Component = 'div',
  display,
}) {
  return (
    <ObjectMember
      as={Component}
      name="VRFrameData"
      data={useVRDisplay(display)}
    />
  )
}

function AboutWebVR({ id, className }) {
  const classes = cx(styles.className, 'playground-web-vr', className)
  const [ds = [], error, pending] = usePromise(useMemo(getVRDisplays, []))
  const foo = { foo: 'bar', baz: { bar: 'foo' } }

  return (
    <Article id={id} className={classes}>
      <Helmet title="WebVR Playground - caasih.net" />
      <h1>WebVR Playground</h1>
      {error && <p>{error.message}</p>}
      {pending
        ? <p>Loading....</p>
        : ds.length === 0 &&
          <p>WebVR supported but no <code>VRDisplay</code>s found.</p>
      }
      {!pending && ds.length !== 0 &&
        <>
          <ObjectMember as="section" name="VRDisplay" data={ds[0]} />
          <FrameData as="section" display={ds[0]} />
        </>
      }
    </Article>
  )
}

export default AboutWebVR
