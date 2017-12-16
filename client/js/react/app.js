import React from 'react/cjs/react.production.min.js';
import { render } from 'react-dom/cjs/react-dom.production.min.js';

import { setup as setupStore } from '../redux/store';
import { init as initActions, getAccounts } from '../redux/actions';

import AppContainer from './components/AppContainer';
import Popup from './components/Popup';

import {
  setupLoginPageListener
} from './misc';

import {
  fetchAccounts
} from '../redux/services';

const store = setupStore(renderApp);
initActions(store);

function renderApp(props) {
  const state = store.getState();
  //console.log(state);
  render(
    React.createElement(AppContainer, Object.assign({}, state.app, {popup: state.popup}), null),
    document.querySelector('#app')
  );
}

setupLoginPageListener();

fetchAccounts();
