if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/js/sw.js')
    .then((reg) => {
      console.log('the service worker is registered with scope:', reg.scope)
    })
    .catch((err) => {
      console.log('registration failed:', err)
    })
}
