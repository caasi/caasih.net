去年中開始看 Douglas Crockford 的 &#8220;JavaScript: The Good Parts&#8221;，才知道 JavaScript 這幾年不是無緣無故翻身。而 prototype-based OOP 與 class-based OOP 的比較，讓我對 OOP 有了不同的認識。

先看看 prototype 繼承的用法， Crockford 的[作法](http://javascript.crockford.com/prototypal.html)是：

```javascript
function beget(o) {
  function F() {};
  F.prototype = o;
  return new F();
}
```

之所以不能簡單的先隨便弄個新的 instance `n` 再讓 `n.prototype = o` ，是因為 ECMAScript 不云許隨便抽換 instance 的 prototype ，真正的 prototype 是存在一個內部變數， Dmitry Soshnikov 稱它為 `[[prototype]]` ， FireFox 的 SpiderMonkey 有個非標準的變數 `__proto__` 就是讓這個 `[[prototype]]` 可以被存取。

牛人 Dmitry Soshnikov 在介紹到繼承時的[範例](http://dmitrysoshnikov.com/ecmascript/chapter-7-2-oop-ecmascript-implementation/#prototype-chain)是：

```javascript
var inherit = (function(){
  function F() {}
  return function (child, parent) {
    F.prototype = parent.prototype;
    child.prototype = new F;
    child.prototype.constructor = child;
    child.superproto = parent.prototype;
    return child;
  };
})();
```

之所以都要有個放在 closure 裡面的 F ，是為了避免直接用到 parent 的 constructor 。

悲劇的是以前寫 AS2 時， AS2 包裝 class inheritance 的方法沒那麼好，結果無法控制 parent class 第一次初始化的時間，我的 class constructor 就在意料外的時候執行。

JavaScript 的[ prototype-based 跟 class-based 不衝突](http://javascript.crockford.com/inheritance.html)很讚，而我不想，也沒能力跳到動態與靜態語言之爭。另我好奇的是，如果 OO 的重點不在於怎麼繼承而在於 reuse 的話，那種方法並不重要不是嗎？這樣要是有個專注在 reuse 上面的語言，會長什麼樣子呢？

大牛 jserv 曾寫過[以 C 語言實做 Javascript 的 prototype 特性](http://blog.linux.org.tw/~jserv/archives/002057.html)這樣酷的文章，可見 C 要用 prototype 或 class 來 reuse 都可行，要是能把細節藏起來提供 syntax sugar 或是有好的 IDE 就更棒了。

另外一方面，從這個角度重看[ c2.com整理的 OO定義](http://c2.com/cgi/wiki?AlanKaysDefinitionOfObjectOriented)，可以簡化為：

  1. 一切皆為物件
  2. 物件有自己的記憶體，可以包含別的物件
  3. 物件藉由傳遞訊息來溝通，溝通的目的是為了要求別的物件作些事
  4. 物件可以把訊息委派給其他物件

所以我們有機會擁有更簡潔但是一樣強大的語言對吧？對吧？（興奮）不知道會是什麼樣的語言？搞不好已經有了但是我不知道 XDD

