// Reducer
var accounts = undefined;

function app(state, action) {
    var newState = undefined;
    switch (action.type) {
        case 'GET_ACCOUNTS':
            accounts = JSON.parse(JSON.stringify(action.payload));
            accounts.selectedMenuIndex = localStorage && localStorage.getItem('selectedTab') || 0;
            newState = Object.assign({}, state, accounts);
            break;
        case 'MENU_SELECT':
            localStorage.setItem('selectedTab', action.payload);
            const selectedMenuIndex = action.payload;
            newState = Object.assign({}, state, {selectedMenuIndex});
            break;
        case 'GROUP_CLICK':
            newState = Object.assign({}, state, {});
            break;
        }
    return newState || state || {};
}

function popup(state, action) {
    var newState = undefined;
    var account = undefined;
    switch (action.type) {
        case 'POPUP_ACCOUNT':
            account = accounts.liabilities
                .filter(a => a.title.toLowerCase() === action.payload.title.toLowerCase());
            newState = Object.assign({}, state, {
                error: account[0] ? false : 'could not find account',
                account: JSON.parse(JSON.stringify(account[0] || false))
            });
            break;
        case 'POPUP_CANCEL':
            account = undefined;
            newState = Object.assign({}, state, {error: 'not initialized', account: undefined})
            break;
    }
    return newState || state || {};
}

export default { app, popup };