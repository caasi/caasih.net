import { useState, useEffect } from 'react'

export default function useFold<X, A>(x: X, f: (acc: A, x: X) => A, init: A): A {
  const [acc, setAcc] = useState(init)

  useEffect(() => {
    setAcc(f(acc, x))
  }, [x, f])

  return acc
}
