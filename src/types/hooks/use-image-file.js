import compose from './compose'
import useFile from './use-file'
import useImageData from './use-image-data'

const useImageFile = compose(useImageData, useFile)

export default useImageFile
