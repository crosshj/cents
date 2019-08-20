import createStore from 'redux/es/createStore';
import reducers from '../reducers';

const initialState = {
    app: {
        error: 'not initialized'
    }, 
    popup: {
        error: 'not initialized'
    },
    page: document.location.hash.slice(1) || '/accounts'
};

function setup(renderer){
    const store = createStore(
        reducers,
        initialState,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );
    store.subscribe(renderer);

    return store;
}

export { setup };
