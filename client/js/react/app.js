/*

TODO:

- store
- actions

*/

import React from 'react';
import { render } from 'react-dom';

import { setup as setupStore } from '../redux/store';
import { init as initActions, getAccounts } from '../redux/actions';

import AppContainer from './components/AppContainer';
import Popup from './components/Popup';

import {
  fetchAccounts,
  setupLoginPageListener
} from './misc';

const store = setupStore(renderApp);
initActions(store);

function renderApp(props) {
  const state = store.getState();
  //console.log(state);
  render(
    React.createElement(AppContainer, Object.assign({}, state.app, {popup: state.popup}), null),
    document.querySelector('#app')
  );
  // render(
  //   React.createElement(Popup, state.popup, null),
  //   document.querySelector('#popup-modal')
  // );
}

setupLoginPageListener();

fetchAccounts((err, res) => {
  const payload = res || {};
  payload.error = err || res.error || false;
  getAccounts(payload);
});
