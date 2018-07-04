import React from 'react'
import { render } from 'enzyme'
import configureStore from 'redux-mock-store'

import { initialState } from 'reducers'
import Root from './Root'

const mockStore = configureStore()
const store = mockStore(initialState)

describe('components', () => {
  describe('Root', () => {
    it('should render self without any error', () => {
      const comp = render(<Root store={store} />)
      expect(comp.hasClass('caasih')).toBe(true)
    })
  })
})
