現在的案子已經靠 [Babel][learn-babel] （之前叫做 6to5 ） ，使用 ES6 寫 React(0.12.0) Component 。

用到的特性有：

* [Arrows][arrows]
* [Enhanced Object Literals][enhanced-object-literals]
* [Destructuring][destructuring]
* [Modules][modules]

最後交給 [webpack][webpack] 打包，細節就不詳述。

## 所以現在是怎麼寫 React Component 的？

以麵包屑為例，一開始先為 component 打個骨架：

```jsx
import React from 'react';

var Breadcrumbs = React.createClass({
  render() {
    return <nav />;
  }
});

export default Breadcrumbs;
```

現在這個 Breadcrumbs 啥也不做，只是一個 `<nav />` 標籤。使用 ES6 的 `import` 和 `export` ，而不是 `var React = require('react')` 與 `module.exports = Breadcrumbs` 。在 ES6 的 [Enhanced Object Literals][enhanced-object-literals] 幫助下，可以少打幾個字，而不用寫：

```jsx
{
  render: function () {
    return <nav />;
  }
}
```

接著把缺少的部分補上：

```jsx
import React from 'react';

var Breadcrumbs = React.createClass({
  render() {
    return (
      <nav className="breadcrumbs">
        <a href="index.html">Home</a>
        <span><span className="divider">›</span>React</span>
        <span><span className="divider">›</span>About</span>
      </nav>
    );
  }
});

export default Breadcrumbs;
```

接著希望它能發揮麵包屑該有的功能，於是在 props 裡給出現在的路徑：

```jsx
import React from 'react';

var Breadcrumbs = React.createClass({
  getDefaultProps() {
    return {
      path: ['React', 'About'];
    };
  },
  render() {
    var { path } = this.props;
    return (
      <nav className="breadcrumbs">
        <a href="index.html">Home</a>
        {
          path.map((v) => {
            return <span><span className="divider">›</span>{v}</span>
          })
        }
      </nav>
    );
  }
});

export default Breadcrumbs;
```

這邊使用到 [Destructuring][destructuring] ，

```javascript
var { path } = this.props;
```

相當於：

```javascript
var path = this.props.path;
```

遇到像這樣的狀況，可以少打很多字，又讓 code 好讀：

```javascript
var { str, con, dex, int, wiz, cha } = this.props;
```

接著靠 `Array.prototype.map` 列舉 `path` 的內容，用 [Arrows][arrows] `() => {}` 取代長長的 `function () {}` ，加上 [Fat Arrows][arrows] 會自動綁定 function 裡面的 `this` ，用在 click 之類的事件上很方便，例如：

```jsx
render() {
  return <div onClick={() => this.setState({ foo: 'bar' })}>foobar</div>;
}
```

而不用再寫：

```jsx
render() {
  var self = this;
  return <div onClick={() => self.setState({ foo: 'bar' })}>foobar</div>;
}
```

最後 import 該 component 的 scss ，就完成了：

```javascript
import React from 'react';
import './Breadcrumbs.scss';
```

## 別的 Component 怎麼使用這個 Component ？

上層只要 `import` 即可：

```jsx
import Breadcrumbs from './Breadcrumbs';

/* 略 */

  render() {
    return (
      <div>
        <Breadcrumbs path={['More', 'React', 'About']} />
      </div>
    );
  }

/* 略 */
```

## 參考資料

[6to5 改叫 Babel][not-born-to-die] 了，[它的教學][learn-babel]教了我很多，中文的 [ECMAScript 6 入门][es6-intro] 也很棒，但是沒有個別功能的連結。 [@lyforever][ly] 還推薦了 [Understanding ECMAScript 6][understanding-es6] 。

## EDIT

再次感謝 [@lyforever][ly] review jsx 。

[arrows]: https://babeljs.io/docs/learn-es6/#arrows
[enhanced-object-literals]: https://babeljs.io/docs/learn-es6/#enhanced-object-literals
[destructuring]: https://babeljs.io/docs/learn-es6/#destructuring
[modules]: https://babeljs.io/docs/learn-es6/#modules
[webpack]: http://webpack.github.io/
[not-born-to-die]: https://babeljs.io/blog/2015/02/15/not-born-to-die/
[learn-babel]: https://babeljs.io/docs/learn-es6/
[es6-intro]: http://es6.ruanyifeng.com/
[ly]: https://twitter.com/lyforever
[understanding-es6]: https://leanpub.com/understandinges6/read
