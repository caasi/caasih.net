import React from 'react'
import styles from './index.css'

function ColorRect({ data }) {
  return (
    <div
      className={styles.colorRect}
      style={data}
    />
  )
}

export default ColorRect
