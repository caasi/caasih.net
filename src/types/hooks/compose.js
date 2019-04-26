function compose(useF, useG) {
  return function(x) {
    return useF(useG(x))
  }
}

export default compose
