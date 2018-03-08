import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import Then from 'components/Then'
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

  constructor(props) {
    super(props)
    this.state = {
      name: Promise.resolve('Isaac').then(delay(5000)),
      age: Promise.resolve(35).then(delay(10000)),
      foo: Promise.resolve(0)
    }
  }

  handleClick = (e) => {
    const { foo } = this.state

    e.preventDefault()
    this.setState({ foo: foo.then(delay(500)).then(v => v + 1) })
  }

  render() {
    const { id, className } = this.props
    const { name, age, foo } = this.state
    const classes = cx(styles.className, 'caasih-playground', className)

    return (
      <div id={id} className={classes}>
        <h1>the Playground</h1>
        <h2>&lt;Then /&gt;</h2>
        <p>You can wait for promises by lifting the inner component with a wrapper.</p>
        <section>
          <Then name={name} age={age}>
            <People />
          </Then>
          <br />
          <Then foo={foo}>{
            ({ foo }) =>
              <span>
                Delayed counter: { foo }.
                <br />
                <a herf="#" onClick={this.handleClick}>Increase me!</a>
              </span>
          }</Then>
        </section>
      </div>
    )
  }
}



export default Playground
