/*

TODO:

- store
- actions

*/

import React from 'react';
import { render } from 'react-dom';

import { setup as setupStore } from '../redux/store';

import AppContainer from './components/AppContainer';
import {
  getAccounts,
  setupLoginPageListener
} from './misc';

const store = setupStore(renderApp);

function renderApp(props) {
  const state = Object.assign({}, props, store.getState());
  //console.log(state);
  render(
    React.createElement(AppContainer, state.app, null),
    document.querySelector('#app')
  );
}

setupLoginPageListener();

getAccounts((err, res) => {
  const payload = res || err;
  payload.error = res.error || false;
  store.dispatch({type: 'WOW', payload})
});
