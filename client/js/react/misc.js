var GLOBAL_FUNCTION_QUEUE = [];

function login(){
    document.querySelector('#login').className = '';
    //window.location.replace("login/");
}

function getAccounts(callback) {
    const url = './json';
    const config = {
      credentials: 'include',
      method: 'GET',
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };
    fetch(url, config)
      .then(r => r.json())
      .then(body => {
        // console.log(`Response from ${url} : ${JSON.stringify(body)}`);
        if(body.error){
            GLOBAL_FUNCTION_QUEUE.push(() => getAccounts(callback));
            login();
            return;
        }
        callback(undefined, body)
      })
      .catch(e => {
        GLOBAL_FUNCTION_QUEUE.push(() => getAccounts(callback));
        login();
      });
}

function serializeLogin(username, password){
    return `username=${username}&password=${password}`;
}

function ajaxLogin(username, password, callback){
    const loginBody = serializeLogin(username, password);

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
        console.log('login success -->', data);
        if (callback) callback(null, data);
    }).catch(function(error) {
        console.log('login error --> ', error);
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
        console.log('parent received message!:  ',e.data);

        if(e.data.name === "ajaxLoginRequest"){
        const username = e.data.payload.username;
        const password = e.data.payload.password;

        const callback = () => {
            document.querySelector('#login').className = 'hidden';
            const logInIframe = document.querySelector('iframe');
            logInIframe.location = './login';
            const functionFromQueue = GLOBAL_FUNCTION_QUEUE.pop();
            if(functionFromQueue && typeof functionFromQueue === "function"){
            functionFromQueue();
            }
        }

        ajaxLogin(username, password, callback);
        }
    }, false);
}

export {
    getAccounts,
    setupLoginPageListener
};
