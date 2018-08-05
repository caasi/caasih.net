/* @flow */
export function delay<T>(t: number): T => Promise<T> {
  return v => new Promise(resolve => setTimeout(resolve, t, v))
}
