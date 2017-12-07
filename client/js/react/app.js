/*

TODO:

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
  res.error = res.error || false;
  renderApp(res);
});

document.addEventListener("DOMContentLoaded", () => {
  const initialState = {
    error: 'not initialized'
  };
  renderApp(initialState);
});
