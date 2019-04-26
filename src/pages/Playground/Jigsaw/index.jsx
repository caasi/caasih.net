import React, { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import Article from 'components/Article'
import ImageDataCanvas from 'components/ImageDataCanvas'
import CreativeCommons from 'components/CreativeCommons'
import { useImageFile } from 'types/hooks'

function AboutJigsaw({ id, className }) {
  const classes = cx('playground-zigzag', className)
  const [file, setFile] = useState()
  const imageData = useImageFile(file)

  return (
    <Article id={id} className={classes}>
      <Helmet title="Jigsaw - caasih.net" />
      <h1>Jigsaw</h1>
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files.length === 1) {
            setFile(e.target.files[0])
          }
        }}
      />
      <ImageDataCanvas
        imageData={imageData}
        role="img"
        aria-label={file && file.name}
        style={{ width: '100%' }}
      />
      <CreativeCommons size="compact" type="by" />
    </Article>
  )
}

export default AboutJigsaw
