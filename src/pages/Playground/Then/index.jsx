import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { Then } from '@caasi/then'
import { delay } from 'types/time'
import Article from 'components/Article'
import CreativeCommons from 'components/CreativeCommons'

import styles from './index.css'



const People = (props) => {
  const { name, age } = props

  return <span>I am { name || '???' }. I am { age || '??' } years old.</span>
}

class AboutThen extends Component {
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
    const classes = cx(styles.className, 'playground-then', className)

    return (
      <Article id={id} className={classes}>
        <h1>&lt;Then /&gt;</h1>
        <p>
          做了一個把 React component property 從 <code>T</code> 提升到 <code>Promise&lt;T&gt;</code> 的玩具：
          <a href="https://www.npmjs.com/package/@caasi/then">@caasi/then</a>
        </p>
        <p>用起來大概像這樣：</p>
        <section className={styles.demo}>
          <Then name={name} age={age}>
            <People />
          </Then>
          <br />
          <Then foo={foo}>{
            ({ foo }) =>
              <span>
                Delayed counter: { foo }.
                <br />
                <button onClick={this.handleClick}>Increase</button>
              </span>
          }</Then>
        </section>
        <p>
          雖然 TonyQ 大大在 fb <a href="https://www.facebook.com/caasihuang/posts/10209375463222355">提醒說</a>這樣會打亂 React 的生命週期。但這個套件的初衷是將 component 看成 function ，像 <code>Promise</code> 在 JavaScript 中，把時間抽象掉，只留下「先後順序」那樣。
        </p>
        <p>
          其實<a href="https://github.com/g0v/itaigi">新台語·運動</a>用到的 <a href="https://github.com/RickWong/react-transmit">react-transmit</a> 也做了類似的事情，只是它用 higher-order component 達成，而不是組合 component 。
        </p>
        <p>
          於是我不關心餵給這個 component 的 promise 們什麼時候完成，我只在意完成後它該怎麼顯示。正如我們寫 React compmonet 時，不在意背後怎麼 render 整個 virtual DOM ，只「描述」我們希望它顯示成什麼樣子。
        </p>
        <hr />
        <p>
          （說到 higher-order 就有氣，明明是可以<a href="http://babel.ls.fi.upm.es/~pablo/Papers/Notes/f-fw.pdf" title="A Short Introduction to Systems F and Fw">好好定義</a>的詞，現在講成什麼「接收一個或以上的 function 作為參數或回傳 function 作為回傳值」，那我要問：「 higher 是比較級，那它是 higher than what? 」，還有「 order 是什麼呢？可以舉 order 為 1 或 order 為 2 的 function 給我看看嗎？」，北七欸）
        </p>
        <CreativeCommons size="compact" type="by" />
      </Article>
    )
  }
}



export default AboutThen
