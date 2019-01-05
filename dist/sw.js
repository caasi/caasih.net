var cacheName = '0';

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
  event.waitUntil(
    caches.open(cacheName)
      .then(function(cache) {
        return cache.addAll([
          '/css/main.css',
          '/js/main.js',
          '/js/vendor.js'
        ]);
      })
  );
});

self.addEventListener('active', function(event) {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', function(event) {
  var ps;
  switch(event.data.type) {
    case 'iscached':
      ps = event.data.uris.map(function(uri) {
        return caches.match(uri).then(function(res) { return !!res; });
      });
      Promise.all(ps)
        .then(function(results) {
          event.ports[0].postMessage(results);
        });
      break;
    default:
      event.ports[0].postMessage(event.data);
  }
});
