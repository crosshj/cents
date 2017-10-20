/*
adapted from https://gist.github.com/matthiasg/56b5915c61cbc6a384d9

from https://gist.github.com/adactio/fbaa3a5952774553f5e7

https://googlechrome.github.io/samples/service-worker/custom-offline-page/
https://github.com/phamann/embrace-the-network/blob/master/src/stale-while-revalidate/sw.js
https://github.com/GoogleChrome/sw-toolbox#defining-routes
https://github.com/mozilla/serviceworker-cookbook/tree/master/virtual-server

OTHER:
https://googlechrome.github.io/samples/service-worker/post-message/index.html


https://serviceworke.rs/

*/

// Update 'version' if you need to refresh the cache
var staticCacheName = 'static';
var version = 'v1.0.3::';

self.addEventListener('activate', function (event) {
  event.waitUntil(clearStaleCaches());
});

self.addEventListener('install', function (event) {
  event.waitUntil(updateStaticCache());
});

self.addEventListener('fetch', fetchHandler);


// --- FUNCTION DEFS -----------------------------------------------------------
// (will be hoisted because using function keyword)

// Store core files in a cache (including a page to display when offline)
function updateStaticCache() {
  return caches.open(version + staticCacheName)
    .then(function (cache) {
      return cache.addAll([
        'https://fonts.googleapis.com/css?family=Raleway:400,300,600',
        'https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js',
        './css/skeleton.css',
        './css/cents.css',
        './css/font-awesome.min.css',
        //'/fonts/fontawesome-webfont.woff?v=4.4.0',
        './js/flickity.pkgd.js',
        './js/highcharts.4.2.2.js',
        './js/moment.2.18.1.min.js',
        './js/accountData.js',
        './js/popup.js',
        './js/app.js',
        './offline.html'
      ]);
    });
}

function clearStaleCaches(){
  return caches.keys()
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
    });
}

function offlineResponse(request){
  // If the request is for an image, show an offline placeholder
  // if (!!~request.headers.get('Accept').indexOf('image')) {
  //   return new Response('<svg width="400" height="300" role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', { headers: { 'Content-Type': 'image/svg+xml' } });
  // }

  if(!!~request.headers.get('Accept').indexOf('application/json')){ 
    const fallbackResponse = {
      error: "offline"
    };
    const jsonResponse = new Response(JSON.stringify(fallbackResponse), {
      headers: {'Content-Type': 'application/json'}
    });
    return jsonResponse;
  }
  const htmlResponse = caches.match('./offline.html');
  return htmlResponse;
}

function fetchHandler(event){
  var request = event.request;

  // non-GET requests, -> NETWORK -> OFFLINE
  if (request.method !== 'GET') {
    event.respondWith(
      fetch(request)
        .catch(function () {
          return offlineResponse(request);
        })
    );
    return;
  }

  // HTML requests, -> NETWORK -> CACHE -> OFFLINE
  if (!!~request.headers.get('Accept').indexOf('text/html')
    || !!~request.headers.get('Accept').indexOf('application/json')
  ) {
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
              return response || offlineResponse(request);
            });
        })
    );
    return;
  }

  // non-HTML requests, CACHE -> NETWORK -> OFFLINE
  event.respondWith(
    caches.match(request)
      .then(function (response) {
        return response || fetch(request)
          .catch(function () {
            return offlineResponse(request);
          });
      })
  );
}

