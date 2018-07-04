R:

這幾個月都在寫 React.js ，本來以為自己跟 React 滿合的，沒想到缺乏設計軟體系統的經驗讓自己吃了大虧。整個狀況大概可以簡化成下面這個例子：

## 一切都很好

一開始，要作個開關。

<iframe width="100%" height="300" src="http://jsfiddle.net/tx0a8mqu/1/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

React 好棒棒，一下就做好了！還可以封裝到 `<Button>` 裡面！萬歲！

## 加點什麼吧？

那麼，變成三個開關吧！

<iframe width="100%" height="300" src="http://jsfiddle.net/tx0a8mqu/2/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

那就把開關排三次就好啦，沒什麼難的！還做了個 `<ButtonGroup>` 出來咧！

## 需求又改了

那如果我希望按下一個開關，可以自動把其他開關都關掉呢？只好把狀態都移上來。

<iframe width="100%" height="300" src="http://jsfiddle.net/tx0a8mqu/3/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## 下一步要往哪走？

可是隔壁的老王說，他想要一組原來的開關，只好。

<iframe width="100%" height="300" src="http://jsfiddle.net/tx0a8mqu/5/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

這樣一來， `<ButtonGroup>` 要嘛有兩種，要嘛得在 `this.props` 加個值，好決定該表現哪種行為。

## Single Source of Truth

還不如讓最上層管理所有的狀態。

<iframe width="100%" height="300" src="http://jsfiddle.net/tx0a8mqu/6/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

## 於是...

才知道為什麼 React 要分 props 和 state ，也知道寫個 stateless 的 component 到底方便在哪裡。如果按以前慣用的做法，讓各個 component 保有自己的狀態，然後到處發事件，光是聽事件的 code 就會扭成一團。對開發中的應用，哪些狀態彼此相關，常常在改變，甚至在不同層級間移動。

也看出 Flux 這個架構å¥½在哪裡，如果 component 沒有狀態，那麼它就是個把 props/attributes 轉換成 HTML 的函式，對一種輸入只會有一種輸出。

只是知道得好像有點晚了 XDD

但沒關係，對系統外面來說，[沒有時間也就沒有狀態](http://only-perception.blogspot.tw/2013/10/blog-post_24.html "其實我也沒能力吃下來源並理解它，只好看成一個有趣的新知，並嘲笑國中時的自己")，自然也沒有狀態該擺哪裡這種煩惱。

## EDIT

* 感謝 [@lyforever](https://twitter.com/lyforever) 建議直接嵌入 fiddles 。

