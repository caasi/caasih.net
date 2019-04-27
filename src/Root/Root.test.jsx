import React from 'react'
import { render } from 'enzyme'

import Root from './Root'

describe('components', () => {
  describe('Root', () => {
    it('should render self without any error', () => {
      const comp = render(<Root />)
      expect(comp.hasClass('caasih')).toBe(true)
    })
  })
})
