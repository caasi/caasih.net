import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import LiftPromise from 'components/LiftPromise'
import { delay } from 'types/time'

import styles from './index.css'




const People = (props) => {
  const { name, age } = props

  return <span>I am { name || '???' }. I am { age || '??' } years old.</span>
}

class Playground extends Component {
  static propTypes = {
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  render() {
    const { id, className } = this.props
    const classes = cx(styles.className, 'caasih-playground', className)

    return (
      <div id={id} className={classes}>
        <h1>the Playground</h1>
        <h2>LiftPromise</h2>
        <p>You can wait for promises by lifting the inner component with a wrapper.</p>
        <section>
          <LiftPromise
            name={Promise.resolve('Isaac').then(delay(5000))}
            age={Promise.resolve(35).then(delay(10000))}
          >
            <People />
          </LiftPromise>
        </section>
      </div>
    )
  }
}



export default Playground
