import React, { useCallback } from 'react'

function ImageDataCanvas({ imageData, ...props }) {
  const { width = 0, height = 0 } = imageData || {}

  const ref = useCallback(node => {
    if (node && imageData) {
      const ctx = node.getContext('2d')
      ctx.putImageData(imageData, 0, 0)
    }
  }, [imageData])

  return (
    <canvas
      {...props}
      ref={ref}
      role="img"
      width={width}
      height={height}
    />
  )
}

export default ImageDataCanvas
