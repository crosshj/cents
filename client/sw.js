

self.addEventListener('install', function (event) {
    console.log('installed service worker');
});

self.addEventListener('activate', function (event) {
    console.log('activated service worker');
});

self.addEventListener('fetch', event => {
    // event.waitUntil(async function() {
    //     // Exit early if we don't have access to the client.
    //     // Eg, if it's cross-origin.
    //     if (!event.clientId) return;
    
    //     // Get the client.
    //     const client = await clients.get(event.clientId);
    //     // Exit early if we don't get the client.
    //     // Eg, if it closed.
    //     if (!client) return;
    
    //     // Send a message to the client.
    //     client.postMessage({
    //         msg: "SW Fetch request",
    //         url: event.request.url
    //     });
    // }());

    // fetch and respond
    var request = event.request;
    event.respondWith(
        fetch(request)
            .then(res => {
                console.log('---', res.url, res.status);
                if(res.redirected){
                    var fallbackResponse = {
                        mustLogin: true
                    };
                    return new Response(JSON.stringify(fallbackResponse), {
                        headers: {'Content-Type': 'application/json'}
                      });
                }
                return res;
            })
            .catch(function () {
                console.log('error fetching');
            })
    );
    return;
});
