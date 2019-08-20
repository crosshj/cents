//import React from 'react/cjs/react.production.min.js';
//import { render } from 'react-dom/cjs/react-dom.production.min.js';

import React from 'react';
import { render } from 'react-dom';

import { setup as setupStore } from './redux/store';
import { init as initActions } from './redux/actions';

import AppContainer from './components/AppContainer';

import {
  setupLoginPageListener,
  registerServiceWorker
} from './helpers/misc';

import {
  fetchAccounts
} from './redux/services';

import './css/index.scss';

const store = setupStore(renderApp);
initActions(store);

function renderApp() {
  const state = store.getState();
  //console.log(state);
  render(
    React.createElement(AppContainer, Object.assign({}, state.app, {popup: state.popup, page: state.page}), null),
    document.querySelector('#app')
  );
}

setupLoginPageListener();
registerServiceWorker();
fetchAccounts();
