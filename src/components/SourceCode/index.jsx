import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { github } from 'react-syntax-highlighter/dist/styles/hljs'
import styles from './index.css'

class SourceCode extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    lanugage: PropTypes.string,
    label: PropTypes.string,
    defaultOpen: PropTypes.bool,
  }

  static defaultProps = {
    className: '',
    label: 'source',
    defaultOpen: false,
  }

  constructor(props) {
    super(props)

    this.state = {
      open: props.defaultOpen,
    }
  }

  render() {
    const { id, className, children, language, label } = this.props
    const { open } = this.state
    const classes = cx(styles.className, 'caasih-source-code', className)

    return (
      <div id={id} className={classes}>
        <label onClick={() => this.setState({ open: !open })}>
          {open ? '-' : '+'} {label}
        </label>
        {
          open &&
          <SyntaxHighlighter language={language} style={github}>
            {children}
          </SyntaxHighlighter>
        }
      </div>
    )
  }
}

export default SourceCode
