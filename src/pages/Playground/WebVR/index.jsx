import React, { useMemo } from 'react'
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

function AboutWebVR({ id, className }) {
  const classes = cx(styles.className, 'playground-web-vr', className)
  const [ds = [], error] = usePromise(useMemo(getVRDisplays, []))

  return (
    <Article id={id} className={classes}>
      <Helmet title="WebVR Playground - caasih.net" />
      <h1>WebVR Playground</h1>
      {error && <p>{error.message}</p>}
      {ds.length === 0 &&
        <p>WebVR supported but no <code>VRDisplay</code>s found.</p>
      }
      {ds.length !== 0 &&
        <ul>
          <li>VRDisplay: {ds[0].displayId} - {ds[0].displayName}</li>
        </ul>
      }
    </Article>
  )
}

export default AboutWebVR
