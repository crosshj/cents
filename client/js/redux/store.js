import {createStore, combineReducers} from 'redux';
import devToolsEnhancer from 'remote-redux-devtools';

// Reducer
function counter (state, action) {
    var newState = undefined;
    switch (action.type) {
        case 'WOW':
            newState = Object.assign({}, state, {
                count: state.count +1,
                app: action.payload,
                error: undefined
            });
            break;
    }
    return newState || state;
}

const initialState = {
    count: 1,
    app: {
        error: 'not initialized'
    }
};

function setup(renderer){
    const store = createStore(
        counter,
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