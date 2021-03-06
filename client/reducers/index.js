import app from './app';
import page from './page';
import popup from './popup';
import root from './root';
import global from './global';

// FIX: jest doesn't like this!
//import combineReducers from 'redux/es/combineReducers';
import { combineReducers } from 'redux';

const reducers = {
    app: root.bind(app),
    popup: root.bind(popup),
    page: root.bind(page),
    root: root.bind(global)
};

const rootReducer = (state, action) => {
    root(state, action);
    return combineReducers(reducers)(state, action);
};

export default rootReducer;
