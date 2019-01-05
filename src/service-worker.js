if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((reg) => {
      sendMessage('a service worker is registered with scope: ' + reg.scope)
        .then(console.log)
      // XXX: I can just ask `window.caches`
      isCached('js/main.js', 'js/vendor.js', 'index.html')
        .then(([isMainCached, isVendorCached, isIndexCached]) => {
          console.log('is main.js cached:', isMainCached)
          console.log('is vendor.js cached:', isVendorCached)
          console.log('is index.html cached:', isIndexCached)
        });
    })
    .catch((err) => {
      console.log('registration failed:', err)
    })
}

function sendMessage(message) {
  return new Promise(function(resolve, reject) {
    var messageChannel = new MessageChannel()
    messageChannel.port1.onmessage = function(event) {
      if (event.data.error) {
        reject(event.data.error)
      } else {
        resolve(event.data)
      }
    }

    navigator.serviceWorker.ready.then((reg) => {
      reg.active.postMessage(
        message,
        [messageChannel.port2]
      )
    })
  })
}

export function isCached(...uris) {
  return sendMessage({ type: 'iscached', uris })
}
