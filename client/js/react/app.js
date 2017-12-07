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
import {
  getAccounts,
  setupLoginPageListener
} from './misc';

function renderApp(props) {
  render(
    React.createElement(AppContainer, props, null),
    document.querySelector('#app')
  );
}

setupLoginPageListener();
getAccounts((err, res) => {
  renderApp(res);
});

document.addEventListener("DOMContentLoaded", renderApp);
