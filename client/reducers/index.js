import app from './app';
import popup from './popup';
import root from './root';

// FIX: jest doesn't like this!
//import combineReducers from 'redux/es/combineReducers';
import { combineReducers } from 'redux';

const reducers = {
    app: root.bind(app),
    popup: root.bind(popup)
};

const rootReducer = (state, action) => {
    root(state, action);
    return combineReducers(reducers)(state, action);
}

export default rootReducer;
