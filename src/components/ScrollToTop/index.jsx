import React, { PureComponent } from 'react'
import { withRouter } from 'react-router'

class ScrollToTop extends PureComponent {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0)
    }
  }

  render() {
    const {
      as, children,
      history, location, match, staticContext,
      ...props
    } = this.props

    return React.createElement(as, props, children)
  }
}

export default withRouter(ScrollToTop)
