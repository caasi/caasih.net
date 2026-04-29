import { useState, useEffect } from 'react';

export default function useArray(xs) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [xs]);

  useEffect(() => {
    if (index >= xs.length - 1) return;
    const id = requestAnimationFrame(() => setIndex(i => i + 1));
    return () => cancelAnimationFrame(id);
  }, [xs, index]);

  return xs[index];
}
