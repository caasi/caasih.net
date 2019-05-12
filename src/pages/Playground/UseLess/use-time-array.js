import { useState, useEffect } from 'react'

function useTimeArray(as) {
  const [s, set] = useState()

  useEffect(() => {
    as.map(v => setImmediate(set, v))
  }, [as])

  return s
}

export default useTimeArray
