import { useState, useEffect } from 'react';
import type { Time } from './use-space';

// The only place a value becomes a Time<T>. xs[index] is undefined for an
// empty xs, or for one render after xs gets shorter, so undefined is in the type.
export default function useArray<T>(xs: readonly T[]): Time<T | undefined> {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [xs]);

  useEffect(() => {
    if (index >= xs.length - 1) return;
    const id = requestAnimationFrame(() => setIndex(i => i + 1));
    return () => cancelAnimationFrame(id);
  }, [xs, index]);

  return xs[index] as Time<T | undefined>;
}
