/*

TODO:

- build system (webpack)
- components
- store
- actions


*/

import React from 'react';
import { render } from 'react-dom';
import AppContainer from './components/AppContainer';
const e = React.createElement;

function renderApp(props) {
  render(
    e(AppContainer, props, null),
    document.querySelector('#app')
  );
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
      console.log(`Response from ${url} : ${body}`);
      if(body.error){
        return callback(body.error);
      }
      callback(undefined, body)
    })
    .catch(e => {
      console.log('Error:\n', e);
      callback(e);
    });
}

getAccounts((err, res) => {
  renderApp(res);
});

document.addEventListener("DOMContentLoaded", renderApp);
