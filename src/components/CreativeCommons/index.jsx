import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

const sizeMap = {
  'normal': '88x31',
  'compact': '80x15'
}

class CreativeCommons extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    version: PropTypes.string, // '4.0' | '3.0' | '2.5' | '2.0' | '1.0'
    type: PropTypes.string, // 'by' | 'by-sa' | 'by-nd' | 'by-nc' | 'by-nc-sa' | 'by-nc-nd'
    size: PropTypes.string // 'normal' | 'compact'
  }

  static defaultProps = {
    className: '',
    version: '4.0',
    type: 'by',
    size: 'normal'
  }

  render() {
    const { id, className, version, type, size } = this.props
    const classes = cx('creative-commons', className)

    return (
      <a
        rel="license"
        href={`http://creativecommons.org/licenses/${type}/${version}/`}
      >
        <img
          alt="Creative Commons License"
          style={{ borderWidth: 0 }}
          src={`https://i.creativecommons.org/l/${type}/${version}/${sizeMap[size]}.png`}
        />
      </a>
    )
  }
}

export default CreativeCommons
