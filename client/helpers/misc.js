import {safeAccess} from './utilities';
import { popFunctionQueue } from '../redux/services';

// eslint-disable-next-line no-unused-vars
var GLOBAL_FUNCTION_QUEUE = [];

function ajaxLogin(username, password, callback){
    const loginBody = `username=${username}&password=${password}`;

    fetch('./login/', {
        method: 'POST',
        body: loginBody,
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'same-origin'
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        // console.log('login success -->', data);
        if (callback) callback(undefined, data);
    }).catch(function(error) {
        // console.log('login error --> ', error);
        if (callback) callback(error);
    });
}

function setupLoginPageListener(){
    // Create IE + others compatible event handler
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

    // Listen to message from child window
    eventer(messageEvent,function(e) {
        const messageSource = safeAccess(() => e.data.source);
        if(messageSource && messageSource.includes('devtools')){
            return;
        }
        // console.log('parent received message!:  ',e.data);

        if(e.data.name === "ajaxLoginRequest"){
        const username = e.data.payload.username;
        const password = e.data.payload.password;

        const callback = () => {
            const functionFromQueue = popFunctionQueue();
            if(functionFromQueue && typeof functionFromQueue === "function"){
            functionFromQueue();
            }
        };

        ajaxLogin(username, password, callback);
        }
    }, false);
}

function registerServiceWorker(){
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('sw.new.js', {scope: './'}).then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope); //eslint-disable-line no-console
          }).catch(function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err); //eslint-disable-line no-console
          });
        });
        // var updateUI = () => console.log('TODO: do something different');
        // navigator.serviceWorker.onmessage = event => {
        //   let data = undefined;
        //   try {
        //     data = JSON.parse(event.data);
        //     if(data.type === 'refresh'){
        //       if (/\/json$/i.test(data.url)){
        //         caches.match(data.url)
        //           .then(cached => cached.json())
        //           .then(json => !json.error && updateUI(undefined, json));
        //       }
        //       if (/\/accounts$/i.test(data.url)){
        //         caches.match(data.url)
        //           .then(cached => cached.json())
        //           .then(json => {
        //             const data = window.MAIN_DATA;
        //             if (json.error){
        //               return;
        //             }
        //             data.scraped = json;
        //             updateUI(undefined, data);
        //           });
        //       }
        //     }
        //   } catch (error) {
        //     console.error(error);
        //   }
        // };
      }
}

export {
    setupLoginPageListener,
    registerServiceWorker
};
