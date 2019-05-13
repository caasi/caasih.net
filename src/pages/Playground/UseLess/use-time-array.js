import { useState, useEffect } from 'react'

function useTimeArray(as) {
  const [s, set] = useState()

  useEffect(() => {
    set()
    if (!Array.isArray(as)) return
    as.map(v => setImmediate(set, v))
  }, [as])

  return s
}

export default useTimeArray
