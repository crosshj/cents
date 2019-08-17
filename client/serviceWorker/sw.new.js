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
var version = 'v1.1.14::';
var CACHE = version + staticCacheName;
var timeout = 1500;

//TODO: before refreshing these cache'd items
// , ask if the new version is acceptable!!!
// and some stuff "never" needs to refresh, images/css

var staticCacheList = [
  //TODO: should rarely update these (and only when good)
  './',
  './login/',
  './images/launcher-icon-3x.png',
  './offline.html',
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

  //TODO: these will update possibly with every code push (version)
  './js/build/app.js',
  './js/build/vendor.js',
  './js/build/bundle.css',
  //TODO: vendor.css

];

self.addEventListener('activate', function (event) {
  event.waitUntil(clearStaleCaches());
});

self.addEventListener('install', function (event) {
  event.waitUntil(updateStaticCache());
});

self.addEventListener('fetch', fetchHandler);
//self.addEventListener('fetch', serveCacheAndUpdate); //alternate


// --- FUNCTION DEFS -----------------------------------------------------------
// (will be hoisted because using function keyword)

// Store core files in a cache (including a page to display when offline)
function updateStaticCache() {
  return caches.open(version + staticCacheName)
    .then(function (cache) {
      return cache.addAll(staticCacheList);
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

function deleteAllCaches(){
  // some things will "never" need to be deleted (fonts, images maybe)
  // do not delete these?
  return caches.keys()
    .then(function (keys) {
      return Promise.all(keys
        .map(function(key) { return caches.delete(key); })
      );
    });
}

function offlineResponse(request){
  // If the request is for an image, show an offline placeholder
  // if (!!~request.headers.get('Accept').indexOf('image')) {
  //   return new Response('<svg width="400" height="300" role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', { headers: { 'Content-Type': 'image/svg+xml' } });
  // }
  const isJSRequest = /\.js$/i.test(request.url);
  if(isJSRequest){
    const blankJS = new Response('');
    return blankJS;
  }

  if(!!~request.headers.get('Accept').indexOf('application/json')){
    const fallbackResponse = {
      error: "offline"
    };
    const jsonResponse = new Response(JSON.stringify(fallbackResponse), {
      headers: {'Content-Type': 'application/json'}
    });
    return jsonResponse;
  }
  //const htmlResponse = caches.match('./offline.html');
  return new Response(offlineHTML(),{
    headers: {'Content-Type': 'text/html'}
  });
}

function fetchHandler(event){
  var request = event.request;
  const isHTMLRequest = !!~request.headers.get('Accept').indexOf('text/html');
  const isJSONRequest = !!~request.headers.get('Accept').indexOf('application/json');
  const isManifestRequest = request.url.includes('manifest.json');

  if(isManifestRequest){
    const manifestResponse = new Response(manifestJSON(), {
      headers: {'Content-Type': 'application/json'}
    });
    event.respondWith(manifestResponse);
    return;
  }

  const isKillCache = request.url.includes('killCache');
  if(isKillCache){
    const fallbackResponse = {
      status: "okay"
    };
    const jsonResponse = new Response(JSON.stringify(fallbackResponse), {
      headers: {'Content-Type': 'application/json'}
    });
    event.respondWith(jsonResponse);
    event.waitUntil(
      deleteAllCaches()
        .then(updateStaticCache)
    );
    return;
  }

  const isLoginRequest = request.url.includes('login') && request.method === 'POST';
  if(isLoginRequest){
    event.respondWith(fetch(event.request));
    return;
  }

  // non-GET requests, -> NETWORK -> OFFLINE
  if (request.method !== 'GET') {
    event.respondWith(
      fromNetwork(request, timeout)
        .catch(function () {
          return offlineResponse(request);
        })
    );
    return;
  }

  // always return cached static GETs
  const staticCacheMatches = staticCacheList
    .map(item => item.replace(/^./, ''))
    .filter(x => x !== '/');
  const urlInStatic = request.url === `${self.location.origin}/` || staticCacheMatches.some(m => {
    return request.url.includes(m);
  });
  if(urlInStatic){
    event.respondWith(fromCache(request));
    return;
  }

  // JSON
  const isAccountsRequest = /\/accounts$/i.test(request.url);
  const isMainDataRequest = /\/json$/i.test(request.url);
  const isJSRequest = /\.js$/i.test(request.url);
  const requestToNotifyLater = isAccountsRequest || isMainDataRequest || isJSRequest;
  const isCSSRequest = /\.css$/i.test(request.url);

  if (isJSONRequest && requestToNotifyLater){
    serveCacheAndUpdate(event);
    return;
  }

  // HTML requests, -> NETWORK(timeout) -> CACHE -> OFFLINE
  if (!isCSSRequest && isHTMLRequest || isJSONRequest) {
    event.respondWith(
      fromNetwork(request, timeout)
        .catch(function () {
          return fromCache(request);
        })
    );
    return;
  }

  // non-HTML requests, CACHE -> NETWORK -> OFFLINE
  event.respondWith(
    caches.match(request)
      .then(function (response) {
        return response || fromNetwork(request, timeout)
          .catch(function () {
            return offlineResponse(request);
          });
      })
  );
}

function fromNetwork(request, timeout) {
  return new Promise(function (fulfill, reject) {
    var timeoutId = setTimeout(reject, timeout);

    fetch(request).then(function (response) {
      clearTimeout(timeoutId);
      // Stash a copy of this page in the cache
      // tag as cached if json
      var clone = response.clone();
      const isJSONRequest = !!~request.headers.get('Accept').indexOf('application/json');

      if(request.method !== 'GET'){
        fulfill(response);
        return;
      }

      if(isJSONRequest){
        clone.json().then(json => {
          json.cached = true;
          var jsonRes = new Response(JSON.stringify(json), {
            headers: {
              'content-type': 'application/json'
            }
          });
          caches.open(version + staticCacheName)
          .then(function (cache) {
            cache.put(request, jsonRes);
          });
          fulfill(response);
        });
        return;
      }


      caches.open(version + staticCacheName)
        .then(function (cache) {
          cache.put(request, clone);
        });
      fulfill(response);
    }, reject);
  });
}

// https://serviceworke.rs/strategy-cache-update-and-refresh_demo.html
function serveCacheAndUpdate(event){
  var request = event.request;

  event.respondWith(fromCache(request));
  event.waitUntil(
    update(request)
    .then(refresh)
    .catch(function () {
      return offlineResponse(request);
    })
  );
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
  return caches.open(CACHE)
    .then(function (cache) {
      return cache.match(request).then(matching => {
        // const isJSONRequest = !!~request.headers.get('Accept').indexOf('application/json');
        // var newResponse;
        // if(isJSONRequest && matching){
        //   return matching.json().then(json => {
        //     //debugger;
        //     //console.log({ json });
        //     json.offline = true;
        //     newResponse = new Response(JSON.stringify(json, null, '  '));
        //     //console.log({ json });
        //     return newResponse || Promise.resolve(offlineResponse(request));
        //   });
        // }
        return matching || Promise.resolve(offlineResponse(request));
      });
  });
}

// Update consists in opening the cache, performing a network request and
// storing the new response data.
function update(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  });
}

// Sends a message to the clients.
function refresh(response) {
  return self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {
      // Encode which resource has been updated. By including the
      // [ETag](https://en.wikipedia.org/wiki/HTTP_ETag) the client can
      // check if the content has changed.
      var message = {
        type: 'refresh',
        url: response.url,
        // Notice not all servers return the ETag header. If this is not
        // provided you should use other cache headers or rely on your own
        // means to check if the content has changed.
        eTag: response.headers.get('ETag')
      };
      // Tell the client about the update.
      client.postMessage(JSON.stringify(message));
    });
  });
}

function offlineHTML(){
  const html = `
    <style>
    .btn {
        font-size: 1em;
        display: inline-block;
        padding: 6px 12px;
        margin-bottom: 0;
        line-height: 1.42857143;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        touch-action: manipulation;
        cursor: pointer;
        user-select: none;
        background-image: none;
        border: 1px solid transparent;
        border-radius: 4px;
    }
    div {
        text-align: center;
        font-size: 5rem;
        font-weight: 400;
        font-family: arial;
    }
    span {
        color: white;
        margin: 18px;
        display: inline-block;
    }
    body {
        background-color: rgba(91,89,77,1);
    }
    </style>

    <script>
    function killCache(){
        fetch('./killCache')
          .then(res => res.json)
          .then(json => {
            document.location.reload();
          });
        return false;
    }
    </script>

    <div>
    <span>Offline Mode</span>
    <form onsubmit="return killCache()">
        <input type="submit" value="RELOAD" class="btn"/>
    </form>
    </div>
  `;
  return html;
}

function manifestJSON(){
  const manifest = {
    "test_property": "123",
    "short_name": "Cents",
    "name": "Cents: Personal Finance",
    "background_color": "#746D5D",
    "theme_color": "#746D5D",
    "icons": [
      {
        "src": "./images/launcher-icon-2x.png",
        "sizes": "96x96",
        "type": "image/png"
      },
      {
        "src": "./images/launcher-icon-3x.png",
        "sizes": "144x144",
        "type": "image/png"
      },
      {
        "src": "./images/launcher-icon-4x.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "./images/launcher-icon-512px.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ],
    "start_url": "./#homescreen",
    "display": "standalone",
    "orientation": "portrait"
  };
  return JSON.stringify(manifest, null, '  ');
}
