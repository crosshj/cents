import React from 'react';

function submitHandler(event, /*form*/){
    event.preventDefault();
    var formEl = document.querySelector('form');

    window.parent.postMessage({
        name: 'ajaxLoginRequest',
        payload: {
            username: formEl.querySelector('[name="username"]').value,
            password: formEl.querySelector('[name="password"]').value
        }
    }, '*');

}

function Login(/*props*/){
    return (
        <div id='login'>
            <form name="login">
                <div className="loginView">
                    <div className="header">
                        <img src="../images/launcher-icon-4x.png" />
                    </div>
                    <div className="field">
                        <input name="username" className="form-control input-lg"
                            id="username" type="text" placeholder="Your username"
                            autoComplete="current-username"
                        />
                    </div>
                    <div className="field">
                        <input name="password" className="form-control input-lg"
                            id="password" type="password" placeholder="Your password"
                            autoComplete="current-password"
                        />
                    </div>
                    <div className="">
                        <button type="button" className="btn btn-lg btn-primary btn-block"
                            onClick={() => submitHandler(event, this)}
                        >Sign In</button>
                    </div>
                    <div className="">
                        <button type="button" className="register btn btn-lg btn-secondary btn-block transparent-bg"
                            onClick=""
                        >Register</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Login;
