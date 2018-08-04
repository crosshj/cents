/*
from https://gist.github.com/adactio/fbaa3a5952774553f5e7

https://googlechrome.github.io/samples/service-worker/custom-offline-page/
https://github.com/phamann/embrace-the-network/blob/master/src/stale-while-revalidate/sw.js
https://github.com/GoogleChrome/sw-toolbox#defining-routes
https://github.com/mozilla/serviceworker-cookbook/tree/master/virtual-server

OTHER:
https://googlechrome.github.io/samples/service-worker/post-message/index.html
*/

// Update 'version' if you need to refresh the cache
var staticCacheName = 'static';
var version = 'v2.0.1::';

// Store core files in a cache (including a page to display when offline)
var staticCacheList = [
  './',
  './login/',
  './images/launcher-icon-3x.png',

  './css/raleway.css',
  './css/flickity.2.0.9.css',
  './css/bootstrap.3.3.4.min.css',
  './css/skeleton.css',
  './css/cents.css',
  './css/font-awesome.min.css',

  './fonts/fontawesome-webfont.woff?v=4.4.0',
  './fonts/-_Ctzj9b56b8RgXW8FAriQzyDMXhdD8sAj6OAJTFsBI.woff2 ',
  './fonts/ZKwULyCG95tk6mOqHQfRBAsYbbCjybiHxArTLjt7FRU.woff2',
  './fonts/YZaO6llzOP57DpTBv2GnyFKPGs1ZzpMvnHX-7fPOuAc.woff2',
  './fonts/QAUlVt1jXOgQavlW5wEfxQLUuEpTyoUstqEm5AMlJo4.woff2',
  './fonts/STBOO2waD2LpX45SXYjQBQsYbbCjybiHxArTLjt7FRU.woff2',
  './fonts/xkvoNo9fC8O2RDydKj12bwzyDMXhdD8sAj6OAJTFsBI.woff2',
  './fonts/glyphicons-halflings-regular.woff2',
  './fonts/glyphicons-halflings-regular.woff',
  './fonts/glyphicons-halflings-regular.ttf',

  './js/build/app.js',
  './js/build/vendor.js',
  './offline.html'
];

function updateStaticCache() {
  return caches.open(version + staticCacheName)
    .then(function (cache) {
      return cache.addAll(staticCacheList);
    });
}

self.addEventListener('install', function (event) {
  event.waitUntil(updateStaticCache());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        // Remove caches whose name is no longer valid
        return Promise.all(keys
          .filter(function (key) {
            return key.indexOf(version) !== 0;
          })
          .map(function (key) {
            return caches.delete(key);
          })
        );
      })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  // Always fetch non-GET requests from the network
  if (request.method !== 'GET') {
    event.respondWith(
      fetch(request)
        .catch(function () {
          return caches.match('offline.html');
        })
    );
    return;
  }

  // For HTML requests, try the network first, fall back to the cache, finally the offline page
  if (!!~request.headers.get('Accept').indexOf('text/html') || !!~request.headers.get('Accept').indexOf('application/json')) {
    // Fix for Chrome bug: https://code.google.com/p/chromium/issues/detail?id=573937
    if (request.mode != 'navigate') {
      request = new Request(request.url, {
        method: 'GET',
        headers: request.headers,
        mode: request.mode,
        credentials: request.credentials,
        redirect: request.redirect
      });
    }
    event.respondWith(
      fetch(request)
        .then(function (response) {
          // Stash a copy of this page in the cache
          var copy = response.clone();
          caches.open(version + staticCacheName)
            .then(function (cache) {
              cache.put(request, copy);
            });
          return response;
        })
        .catch(function () {
          return caches.match(request)
            .then(function (response) {
              return response || caches.match('offline.html');
            });
        })
    );
    return;
  }

  // For non-HTML requests, look in the cache first, fall back to the network
  event.respondWith(
    caches.match(request)
      .then(function (response) {
        return response || fetch(request)
          .catch(function () {
            // If the request is for an image, show an offline placeholder
            if (request.headers.get('Accept').indexOf('image') !== -1) {
              return new Response('<svg width="400" height="300" role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', { headers: { 'Content-Type': 'image/svg+xml' } });
            }
          });
      })
  );
});
