使用 Alt 這套 Flux framework 時，我知道 Store 的 `this.waitFor(anotherStore)` 是 sync 的，於是 async 的操作，都得放到 actions 中。

## TL;DR

把 Promise 記起來，避免重複操作，並讓 action 寫起來跟原本的一樣。但該怎麼記，我還沒有個好方法。

[@tomchentw](https://twitter.com/tomchentw) 建議該在 fetch 時解決一切，還提到可以用 [prfun 的 Promise.guard](https://github.com/cscott/prfun#promiseguardfunctionnumber-condition-function-fn--function) ，其他補充在後面。

## 一開始...

按 Alt 的[教學](http://alt.js.org/guide/async/)，會寫出這樣的 action ：

```javascript
fetchLocations() {
  // we dispatch an event here so we can have "loading" state.
  this.dispatch();

  LocationsFetcher.fetch()
    .then((locations) => {
      // we can access other actions within our action through `this.actions`
      this.actions.updateLocations(locations);
    })
    .catch((errorMessage) => {
      this.actions.locationsFailed(errorMessage);
    });
}

locationsFailed(errorMessage) {
  this.dispatch(errorMessage);
}
```

其中第一個 `this.dispatch()` 表示「這件事情將要發生了」，然後 `this.actions.updateLocations(locations)` 表示「成功」， `this.actions.locationsFailed(errorMessage)` 表示失敗。並配上這樣的 store ：

```javascript
handleUpdateLocations(locations) {
  this.locations = locations;
  this.errorMessage = null;
}

handleFetchLocations() {
  // reset the array while we're fetching new locations so React can
  // be smart and render a spinner for us since the data is empty.
  this.locations = [];
}

handleLocationsFailed(errorMessage) {
  this.errorMessage = errorMessage;
}
```

為了知道現在是不是正在抓資料，也許會加上：

```javascript
handleUpdateLocations(locations) {
  this.fetching = false;
  // ...
}

handleFetchLocations() {
  this.fetching = true;
  // ...
}

handleLocationsFailed(errorMessage) {
  this.fetching = false;
  // ...
}
```

如果我希望今天一個操作只會發生一次，我該怎麼做？最傻的方法是在 `handleFetchLocations` 裡面拋個 error 出來：

```javascript
handleFetchLocations() {
  if(this.fetching) {
    throw new Error('in progress');
  }
  this.fetching = true;
  // ...
}
```

但是這麼一來， action 就會變成：

```javascript
fetchLocations() {
  try {
    this.dispatch();

  	LocationsFetcher.fetch()
      .then((locations) => {
        this.actions.updateLocations(locations);
      })
      .catch((errorMessage) => {
        this.actions.locationsFailed(errorMessage);
      });
  } catch(error) {
    this.actions.locationsFailed(error);
  }
}
```

呃，兩套處理錯誤的方法寫在一起。

## 全部交給 Promise

現在想到的解法是，寫個 function 包在 async 動作之外，記下這個動作是不是正在執行：

```javascript
var doOnce = function doOnce(action) {
  var p = null;
  var release = () => p = null;
  return function() {
    if(p) {
      return { p, isNew: false };
    }
    p = action.apply(this, arguments);
    if(!p.then) {
      p = Promise.resolve(p);
    }
    p.then(release, release);
    return { p, isNew: true };
  }
};
```

把 `LocationFetcher` 用 `doOnce` 包起來：

```javascript
var LocationsFetcher = {
  fetch: doOnce(function () {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {

        // resolve with some mock data
        resolve(mockData);
      }, 250);
    });
  })
};
```

然後 action 就可以寫成：

```javascript
fetchLocations() {
  this.dispatch();

  var { p, isNew } = LocationsFetcher.fetch();
  
  if(isNew) {
    p
      .then((locations) => {
        this.actions.updateLocations(locations);
      })
      .catch((errorMessage) => {
        this.actions.locationsFailed(errorMessage);
      });
  }
}
```

因為 Alt 會 bind 正確的 this ，於是可以寫成：

```javascript
fetchLocations() {
  this.dispatch();

  var { p, isNew } = LocationsFetcher.fetch();
  
  if(isNew) {
    p
      .then(this.actions.updateLocations)
      .catch(this.actions.locationsFailed);
  }
}
```

要是不在意 then 和 catch 可能被觸發多次（像是你的 store 不會再發出別的 action ，也很放心讓 React 幫你檢查 DOM 是否需要更新），稍微修改 `doOnce` 後，甚至可以寫成：

```javascript
fetchLocations() {
  this.dispatch();

  LocationsFetcher.fetch();
    .then(this.actions.updateLocations)
    .catch(this.actions.locationsFailed);
}
```

跟本來的 action 幾乎一樣 :D

## 更多

[@tomchentw](https://twitter.com/tomchentw) 在 comment 中提到了個[好方法](https://gist.github.com/tomchentw/b462f574164ac117a276)，只要改寫 `doOnce` ，就可以做到類似的事：

```javascript
var doOnce = function doOnce(action) {
  var p = null;
  var release = () => p = null;
  return function() {
    if(p) {
      return Promise.reject(new Error('in progress'));
    }
    p = Promise.resolve(action.apply(this, arguments));
    p.then(release, release);
    return p;
  }
};
```
