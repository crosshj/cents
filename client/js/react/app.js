/*

TODO:

- store
- actions

*/

import React from 'react';
import { render } from 'react-dom';

import { setup as setupStore } from '../redux/store';
import actions, { init as initActions } from '../redux/actions';

import AppContainer from './components/AppContainer';
import Popup from './components/Popup';

import {
  getAccounts,
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

getAccounts((err, res) => {
  const payload = res || {};
  payload.error = err || res.error || false;
  actions({type: 'GET_ACCOUNTS', payload});
});
