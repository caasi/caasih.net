import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import SyntaxHighlighter from 'react-syntax-highlighter'
import style from 'react-syntax-highlighter/styles/hljs/github'
import styles from './index.css'

class SourceCode extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    lanugage: PropTypes.string,
    label: PropTypes.string,
  }

  static defaultProps = {
    className: '',
    label: 'source',
  }

  state = {
    open: false,
  }

  render() {
    const { id, className, children, language, label } = this.props
    const { open } = this.state
    const classes = cx(styles.className, 'caasih-source-code', className)

    return (
      <div id={id} className={classes}>
        <label onClick={() => this.setState({ open: !open })}>
          {label}
        </label>
        {
          open &&
          <SyntaxHighlighter language={language} style={style}>
            {children}
          </SyntaxHighlighter>
        }
      </div>
    )
  }
}

export default SourceCode
