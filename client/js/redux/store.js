import {createStore, combineReducers} from 'redux';
import devToolsEnhancer from 'remote-redux-devtools';


// Reducer
function reducer (state, action) {
    var newState = undefined;
    switch (action.type) {
        case 'GET_ACCOUNTS':
            newState = Object.assign({}, state, {
                count: state.count +1,
                app: action.payload,
                error: undefined
            });
            break;
        case 'POPUP_ACCOUNT':
            const account = state.app.liabilities
                .filter(a => a.title.toLowerCase() === action.payload.title.toLowerCase());
            newState = Object.assign({}, state, {
                popup: {
                    error: account[0] ? false : 'could not find account',
                    account: JSON.parse(JSON.stringify(account[0] || false))
                }
            });
            break;
    }
    return newState || state;
}

const initialState = {
    count: 1,
    app: {
        error: 'not initialized'
    }, 
    popup: {
        error: 'not initialized'
    }
};

function setup(renderer){
    const store = createStore(
        reducer,
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