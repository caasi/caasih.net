import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import ActionHome from 'material-ui/svg-icons/action/home'
import { Card, CardHeader, CardText } from 'material-ui/Card'
import { grey800 } from 'material-ui/styles/colors'

import styles from './index.css'



class App extends Component {
  static propTypes = {
    className: PropTypes.string,
  }

  static defaultProps = {
    className: '',
  }

  render() {
    const { id, className } = this.props
    const classes = cx(styles.className, 'caasih-app', className)

    return (
      <MuiThemeProvider>
        <div>
          <AppBar
            style={{ background: grey800 }}
            title="caasih.net"
            zDepth={0}
            iconElementLeft={
              <IconButton onClick={() => location = './'}>
                <ActionHome />
              </IconButton>
            }
          />
          <div id="container" style={{ padding: '1rem' }}>
            <Card style={{ marginBottom: '1rem' }}>
              <CardHeader
                title={<a href="http://www.material-ui.com/">Material-UI</a>}
                subtitle="2017/02/07"
              />
              <CardText>
                試著把 <code>&lt;Card&gt;</code> 當文章用。
                <br/>效果並不顯著！
                <br/>
                <br/>看來得自己刻元件。
              </CardText>
            </Card>
            <Card>
              <CardHeader
                title="About"
                subtitle="2017/02/07"
              />
              <CardText>
                卡西（caasih）是個沒受完 CSIE 訓練的半調子碼農。
              </CardText>
            </Card>
          </div>
        </div>
      </MuiThemeProvider>
    )
  }
}



export default App

