var cacheName = '0';

self.addEventListener('install', function(event) {
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

