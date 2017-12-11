import {createStore, combineReducers} from 'redux';
import devToolsEnhancer from 'remote-redux-devtools';

import reducers from './reducers';

const initialState = {
    app: {
        error: 'not initialized'
    }, 
    popup: {
        error: 'not initialized'
    }
};

function setup(renderer){
    const store = createStore(
        combineReducers(reducers),
        initialState,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );
    store.subscribe(renderer);

    // setInterval(function() {
    //     store.dispatch({type: 'DECREMENT'});
    // }, 1000);
    
    // document.addEventListener('click', function() {
    // store.dispatch({type: 'INCREMENT'});
    // });
    return store;
}

export { setup };