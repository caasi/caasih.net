import path from 'path'



export const createAliases = (dirname, dirs) => {
  const ret = {}
  for (const v of dirs) {
    ret[v] = path.resolve(dirname, v)
  }
  return ret
}

