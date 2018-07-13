import React, { PureComponent, Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './index.css'



class List extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
  }

  static defaultProps = {
    className: '',
    label: 'list',
  }

  render() {
    // TODO: implement `as`
    const { id, className, label, children } = this.props
    const empty = Children.count(children) === 0
    const classes = cx(styles.className, 'caasih-program-style-list', { empty }, className)

    return (
      <div className={classes}>
        <label>{label}</label>
        <ul>
          {Children.map(children, (child) => <li>{cloneElement(child)}</li>)}
        </ul>
      </div>
    )
  }
}



export default List
