export function delay(t) {
  return v => new Promise(resolve => setTimeout(resolve, t, v))
}
