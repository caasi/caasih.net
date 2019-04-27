import { useState, useEffect } from 'react'

function useFile(file) {
  const [data, setData] = useState()

  useEffect(() => {
    if (!file) return
    const reader = new FileReader()
    const f = (e) => setData(e.target.result)
    reader.addEventListener('load', f)
    reader.readAsArrayBuffer(file)
    return () => reader.removeEventListener('load', f)
  }, [file])

  return data
}

export default useFile
