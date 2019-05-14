export const colors = [
  '#1abc9c',
  '#2ecc71',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#f1c40f',
  '#e67e22',
  '#e74c3c',
  '#ecf0f1',
  '#95a5a6',
]

const bits = [
  [3, 3, 4, 4, 4, 3, 4, 4, 4, 3, 3],
  [3, 4, 7, 7, 7, 4, 7, 7, 7, 4, 3],
  [4, 7, 7, 7, 7, 7, 7, 6, 6, 7, 4],
  [4, 7, 7, 7, 7, 7, 7, 7, 6, 7, 4],
  [4, 7, 7, 7, 7, 7, 7, 7, 7, 7, 4],
  [3, 4, 7, 7, 7, 7, 7, 7, 7, 4, 3],
  [3, 3, 4, 7, 7, 7, 7, 7, 4, 3, 3],
  [3, 3, 3, 4, 7, 7, 7, 4, 3, 3, 3],
  [3, 3, 3, 3, 4, 7, 4, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3],
]

export const styleMap =
  bits.map(xs =>
    xs.map(x =>
      ({ backgroundColor: colors[x] })
    ))
