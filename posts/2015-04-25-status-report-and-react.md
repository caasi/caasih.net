C ：

今天頻道上提到 [Dr. Alan Kay on the Meaning of “Object-Oriented Programming”](http://userpage.fu-berlin.de/~ram/pub/pub_jf47ht81Ht/doc_kay_oop_en) ，略讀後和朋友 MW 分享了幾段 Alan Kay 在文末講的話：

> [...] all through the seventies and eighties, there were many people who tried to get by with "Remote Procedure Call" instead of thinking about objects and messages. [...]

這段讓我想起 Pete Hunt 的 [React: RESTful UI Rendering](https://www.youtube.com/watch?v=IVvHPPcl2TM) 。影片將 RPC 和 DOM 類比，將 RESTful API 和 React.js 類比。

> [...] in which he showed that using the lamda expressions the right way would allow data to be abstracted by procedures.

而這段和前面提到的 dataless programming ，讓我有點迷惑。

您說：

> 用 (x, y) => x 和 (x, y) => y 來代替心中的 true, false..

讓我想起 [Church encoding](http://en.wikipedia.org/wiki/Church_encoding) ，就有個底了，也貼回去給 MW ，畢竟是他先跟我提é Alan Kay 的生物學背景，還有從細胞來的想像。

* * *

之前一直在煩惱 React 的 component 可以怎麼樣合成，才方便重用，而不會綁死自己，做重複工。

React component 和配著一起用的 jsx 對我來說是這樣的：

`<Foobar />` 這個 component 就好像自訂的 HTML element ，從外面可以傳值給它，叫做 properties ，在裡面寫做 `this.props` ，寫起來像 HTML element 的 attributes ， `<Foobar foo="bar" />` 。 component 可以有自己的狀態，在裡面寫做 `this.state` （開發團隊似乎很小心地選擇了長度一樣的字，在 `getDefaultProps` 和 `getInitialState` 上也可以看到）。

如果把 component 視為吃 `props` 吐 HTML/SVG 的 function ，不用到 `state` 的話，那看來沒有副作用。也難怪 @thecat 大一直強調 "single source of truth" 。也因為看來像 function ，我一直想要組合它們。

在前公司做的事，讓我知道可以靠：

```html
<Foobar>
  <Anything />
</Foobar>
```

做出可以重複使用的 `<Foobar />` ，但複雜的互動該怎麼處理，我還沒有個底。

還沒接觸 FB 的 Flux 前，我的想像是操作 "single source of truth" 來更新應用程式，那時剛好遇上 [Ludum Dare](http://ludumdare.com/compo/) ，還做了個[小遊戲](https://github.com/caasi/react-ld31) ，好處是很簡單就可以紀錄歷史。

FB 的 Flux ，大意是在保持單向的事件流動下（View -> Actions -> Store -> View），寫應用程式。 View 由 React 負責, Store 聽 Actions ， Store 裡是前面提到的 "single source of truth" ， View 該怎麼畫都看它。

FB 講的 Store 可以等其他 Store 處理完事件，靠一個他們稱為 `waitFor` 的 method 。這個 `waitFor` 的實作在 FB 的 Flux 和我現在用的 Alt 裡都[是 sync 的](https://github.com/facebook/flux/blob/44684a9ad8954437040130bf2d1e02e2b776b114/src/Dispatcher.js#L151)，等於強迫我不可以把 async 的程式放在 Store 中。但 Yahoo! 似乎有自己的想法，他們的 `waitFor` [是 async 的](https://github.com/yahoo/dispatchr/blob/422abf10f63ee8f59927b7b9f5f78b77c58f39e8/lib/Action.js#L79)，還得傳個 callback 給它。

Alt 的作者說 Store 很便宜，於是我把應用程式的邏輯幾乎都寫在 Store 中， async 的事情都交給 Actions 做。使用者的操作會觸動 Actions ，某些事情做完後， Store 也會觸動 Actions 。雖然 View 不會更新自己這點減輕了很多負擔，但 Store 和 Store 間藉著 Actions 彼此相依賴，我擔心哪一天還是會讓應用過度複雜，無法維護，開槍打自己的腳。

回到前面講的合成， ReactConf 的 [Making your app fast with high-performance components](https://www.youtube.com/watch?v=KYzlpRvWZ6c) 提到他們靠著在 component 外面再包一層專門連接 Store 的 container component ，來讓裡面的 component 保持純淨，方便測試與重用。

這個 container 可以不用自己手動刻，於是有了 [Mixins Are Dead. Long Live Composition](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) 和 au 推薦的 [RickWong/react-transmit](https://github.com/RickWong/react-transmit) 。

之前關於 Monad 和「打開，做些事情，然後關起來」的討論，讓我還是想組合 React component ，認為：

```html
<Connecter store={ProductStore}>
  <Connecter store={CategoryStore}>
    <ProductPage />
  </Connecter>
</Connecter>
```

應該和下面有一樣的效果：

```html
<Connecter store={CategoryStore}>
  <Connecter store={ProductStore}>
    <ProductPage />
  </Connecter>
</Connecter>
```

但直到昨晚才發現，面對公司實務上的問題，這個作法更方便：

```html
// XXX: ES6
<Container
  stores={{ FooStore, BarStore }}
  transformer={({ FooStore, BarStore }) => {
    var { foo = [] } = FooStore;
    var { bar = [] } = BarStore;
 
    return { foo, bar };
  }}>
  <Foobar />
</Container>
```

才有這樣的感想：

> 最近寫 React 一直鬼打牆想 composite component ，然後才發現我該專注在處理被包起來的 data 。

而且 function 該怎麼組合跟重用，已經很成熟了，我不用再打造自己的工具，讓 `<Foobar />` 用起來像 function 一樣。但這樣就對 Alan Kay 提到的 dataless programming 更好奇了 XD

沒有寫過 [Om](https://github.com/omcljs/om) 和 [Elm](http://elm-lang.org/) （雖然在頻道上和 godfat 口中都聽過幾次），正好奇 Om 用的 cursor 會不會比 container component 更適合處理跨 component 間的溝通，而不會讓 Flux 的 Store 彼此靠 Actions 互相依賴？ React 也有人實作了 [cursor](https://github.com/dustingetz/react-cursor) ，也許會在 side-project 試看看。

另外 LY 已經做過數個 Isomorphic JavaScript 應用，他的心得和我不同，期待和他多聊聊。搞不好我發出 Actions 的方法根本就不對 XDDD

* * *

補充：半夜看 [jlongster / forms-with-react.js](https://gist.github.com/jlongster/75ef6271f81527574125) ，也許我該堅持「吃什麼進去（porps），就該吐什麼出來（onChange/onUpdate）」，而且把這件事自動化。
