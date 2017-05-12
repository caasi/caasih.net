import { createStore, compose, applyMiddleware } from 'redux'
import thunk from './thunk'
import reducer from 'reducers'



export default initialStore => {
  const middlewares = [thunk]

  const store = compose(
    applyMiddleware.apply(null, middlewares)
  )(createStore)(reducer, initialStore)

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default
      store.replaceReducer(reducer)
    })
  }

  return store
}

