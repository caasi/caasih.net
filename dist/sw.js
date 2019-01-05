var cacheName = 'app';

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
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

self.addEventListener('fetch', function(event) {
  if (!/\.(?:bundle|vendor)\.js$/.test(event.request.url)) return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(function(res) {
        var requestToCache;

        if (res) {
          return res;
        }

        requestToCache = event.request.clone();

        return fetch(requestToCache).then(function(res) {
          var responseToCache;

          if (!res || res.status !== 200) {
            return res;
          }

          responseToCache = res.clone();

          caches.open(cacheName)
            .then(function(cache) {
              cache.put(requestToCache, responseToCache);
            })

          return res;
        })
      })
  );
});
