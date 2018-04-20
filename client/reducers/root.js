/*

root reducer:

1) do not output except from bind to another reducer
2) input only comes from actions

*/
var _account = undefined;
var _accounts = undefined;

const globalState = () => ({
    accounts: _accounts,
    account: _account,
    set: ({account, accounts}) => {
        if (account) _account = account;
        if (accounts) _accounts = accounts;
    },
    reset: () => {
        _account = undefined;
        _accounts = undefined;
    }
});

// -----------------------------------------------------------------------------

function receiveAccounts(state, action, root){
    globalState().set({ accounts: action.payload });
}

function root(state = null, action) {
    switch (action.type) {
        case 'RECEIVE_ACCOUNTS':
            receiveAccounts(state, action);
            break;
        case 'RECEIVE_ACCOUNTS_DATA':
            // receiveAccountsData(state, action);
            break;
        case 'RECEIVE_ACCOUNTS_SAVE':
            // receiveAccountsSave(state, action);
            break;
        case 'MENU_SELECT':
            //menuSelect(state, action);
            break;
        case 'SELECT_ACCOUNT_CLICK':
            //selectAccountClick(state, action);
            break;
        case 'GROUP_CLICK':
            //groupClick(state, action);
            break;
        case 'GROUP_REMOVE':
            //groupRemove(state, action);
            break;
        case 'ACCOUNT_SAVE':
            //accountSave(state, action);
            break;
        // from popup reducer
        case 'POPUP_ACCOUNT':
            //popupAccount(state, action);
            break;
        case 'POPUP_UPDATE':
            //popupUpdate(state, action);
            break;
        case 'REMOVE_ITEM':
            //removeItem(state, action);
            break;
        // end popup reducer
        default:
            break;
    }
    return state;
}


function bind(reducer){
    return (state, action) => {
        return reducer(state, action, globalState())
    };
}

root.bind = bind;
root.globalState = globalState;

export default root;
