import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import Article from 'components/Article'
import SourceCode from 'components/SourceCode'
import CreativeCommons from 'components/CreativeCommons'
import * as Prelude from './Prelude.purs'
import PreludeSource from '!raw-loader!./Prelude.purs'

class PureScript extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
  }

  static defaultProps = {
    className: '',
  }

  render() {
    const { id, className } = this.props
    const classes = cx('playground-purescript', className)

    return (
      <Article id={id} className={classes}>
        <h1>PureScript</h1>
        <p>自從上次練習 VAT 驗證後，就再也沒碰過 PureScript 。最近好想用支援 ADT 的語言，撿回來學看看 XD</p>
        <SourceCode open language="haskell">
          {PreludeSource}
        </SourceCode>
        <CreativeCommons size="compact" type="by" />
      </Article>
    )
  }
}

export default PureScript
