import useFold from './use-fold'

// A phantom brand: it exists only in the type checker, never at runtime.
declare const time: unique symbol

// One state of a value that changes over time, e.g. what `useArray` gives
// on each render. A brand cannot attach to null or undefined, so they stay
// unbranded; callers use undefined as a separator.
export type Time<T> =
  | (T & { readonly [time]: true })
  | Extract<T, null | undefined>

// The states of a Time<T>, collected in order. Every array is already a
// space, so Space needs no brand.
export type Space<T> = readonly T[]

const concat = <T>(acc: Space<T>, x: Time<T>): Space<T> => [...acc, x]

function useSpace<T>(state: Time<T>): Space<T> {
  return useFold<Time<T>, Space<T>>(state, concat, [])
}

export default useSpace
