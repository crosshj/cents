let newWorker;
function update(){
    newWorker.postMessage({ action: 'skipWaiting' });
}

function showUpdateBar() {
    //let snackbar = document.getElementById('snackbar');
    //snackbar.className = 'show toast-container';
    var toastHTML = `
        <span>A new version is available.</span>
        <button class="btn-flat toast-action"  onclick="update()">UPDATE</button>
    `;
    //TODO: on dismiss remember until next update
    M.toast({html:toastHTML, displayLength: Number.MAX_SAFE_INTEGER})
}

function updateStatus(status) {
    let swStatus = document.getElementById('swStatus');
    swStatus.innerHTML = status;
}

if ('serviceWorker' in navigator) {
    if(navigator.serviceWorker.controller) {
        console.log('-- alrready a sw registered');
        updateStatus('a service worker is already registered');
        console.log(navigator.serviceWorker.controller);
    } else {
        updateStatus('a service worker is NOT registered');
    }
    navigator.serviceWorker
        .register('service-worker.js')
        .then(reg => {
            console.log({ reg });
            if(reg.waiting){
                newWorker = reg.waiting;
                showUpdateBar();
            }
            reg.addEventListener('updatefound', () => {
                // A wild service worker has appeared in reg.installing!
                newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    console.log('service worker state:');
                    console.log(newWorker.state);
                    // Has network.state changed?
                    switch (newWorker.state) {
                        case 'installed':
                            if (navigator.serviceWorker.controller) {
                                // new update available
                                showUpdateBar();
                            }
                            // No update available
                            break;
                    }
                });
            });
        });

    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });
}