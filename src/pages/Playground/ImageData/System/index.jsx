import React from 'react'
import { useRange } from '@caasi/hooks'
import styles from './index.css'

function Star({ x, y, children }) {
  return (
    <div className={styles.star} style={{ left: x, top: y }}>
      <div>{children}</div>
    </div>
  );
}

function useCirclePath({ x, y }, r, speed) {
  const rad = useRange(0, 2 * Math.PI / speed) * speed
  const dx = Math.cos(rad) * r
  const dy = Math.sin(rad) * r
  return { x: x + dx, y: y + dy }
}

function System() {
  const sun = { x: 200, y: 200 }
  const earth = useCirclePath(sun, 140, 1/1000)
  const moon = useCirclePath(earth, 20, -1/200)

  return (
    <div className={styles.system}>
      <Star {...sun}>☉</Star>
      <Star {...earth}>♁</Star>
      <Star {...moon}>☽︎</Star>
    </div>
  )
}

export default System
