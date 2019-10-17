(function(){

let newWorker;

function showUpdateBar() {
    //let snackbar = document.getElementById('snackbar');
    //snackbar.className = 'show toast-container';
    var toastHTML = newWorker
        ? `
            <span>A new version is available.</span>
            <button class="btn-flat toast-action"  onclick="update()">UPDATE</button>
        `
        : `
            <span>Install this application</span>
            <button class="btn-flat toast-action"  onclick="update()">INSTALL</button>
        `;

    //TODO: on dismiss remember until next update
    M.toast({ html: toastHTML, displayLength: Number.MAX_SAFE_INTEGER })
}

function hideUpdateBar(){
    M.Toast.dismissAll();
}

function updateStatus(status) {
    let swStatus = document.getElementById('swStatus');
    swStatus.innerHTML = status;
}

function registerSW() {
    if(!navigator.onLine){
        console.log('-- offline, will not register service worker');
        return;
    }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('service-worker.js', { scope: './' })
            .then(reg => {
                console.log({ reg });
                if (reg.waiting) {
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
                            case 'activated':
                                updateStatus('a service worker is already registered');
                                hideUpdateBar();
                                break;
                        }
                    });
                });
            });
        return;
    }
}

function update() {
    if(!newWorker){
        registerSW();
        return;
    }
    newWorker.postMessage({ action: 'skipWaiting' });
}
window.update = update;

function setupSideNav(){
    var elems = document.querySelectorAll('.sidenav');
    var options = {};
    var instances = M.Sidenav.init(elems, options);
}

function setupLoadingModal(){
    var elems = document.querySelectorAll('.modal');
    var options = {};
    var instances = M.Modal.init(elems, options);
}

document.addEventListener("DOMContentLoaded", function () {
    setupSideNav();
    setupLoadingModal();

    if ('serviceWorker' in navigator) {
        const currentSW = navigator.serviceWorker.controller;
        if (currentSW && currentSW.scriptURL.includes("sw/service-worker.js")) {
            console.log('-- alrready a sw registered');
            updateStatus('a service worker is already registered');
            console.log(currentSW);
            registerSW(); //for updates...
        } else {
            updateStatus('a service worker is NOT registered');
            showUpdateBar();
        }

        let refreshing;
        navigator.serviceWorker.addEventListener('controllerchange', function () {
            if (refreshing) return;
            window.location.reload();
            refreshing = true;
        });
    }

}); // DOMContentLoaded
}()); // closure
