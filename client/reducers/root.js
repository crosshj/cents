import { clone, safeAccess } from '../js/react/utilities';

/*

root reducer:

1) do not output except from bind to another reducer
2) input only comes from actions

*/
var _account = undefined;
var _accounts = undefined;
var _selected = undefined;

const globalState = () => ({
    accounts: (() => _accounts)(),
    account: (() => _account)(),
    selected: (() => _selected)(),
    set: ({ account, accounts, selected }) => {
        if (account) _account = account;
        if (accounts) _accounts = accounts;
        if (selected) _selected = selected;
    },
    reset: () => {
        _account = undefined;
        _accounts = undefined;
    }
});

// -----------------------------------------------------------------------------
const receiveAccounts = (state, action) => {
    globalState().set({ accounts: action.payload });
}

const receiveAccountsData = (state, action) => {
    globalState().accounts.totals
        = safeAccess(() => globalState().accounts.totals) || {};
    globalState().accounts.totals.balance
        = Number(
            safeAccess(() => action.payload.data.accounts[0].balance) || 0
        );
};

const groupRemove = (state, action) => {
    var accounts = clone(globalState().accounts);
    var account = clone(globalState().account);
    if (!account) {
        console.log('ERROR: cannot remove group when account is not selected');
        return;
    }
    var groupedItems = account.items
        .map(item => (accounts.liabilities
            .filter(x => x.title.toLowerCase() === item.title.toLowerCase()) || [])[0]
        );
    groupedItems.forEach(x => delete x.type);

    accounts.liabilities = accounts.liabilities.filter(
        x => x.title.toLowerCase() !== account.title.toLowerCase()
    );

    globalState().reset();
    globalState().set({ accounts });

    //TODO: maybe trigger accounts save here (service)
}

const popupAccount = (state, action) => {
    //console.log(action.payload.title)
    var accounts = clone(globalState().accounts);
    //console.log([].concat(accounts.liabilities || [], accounts.assets || []));
    var account = [].concat(accounts.liabilities || [], accounts.assets || [])
        .find(
            a => a.title.toLowerCase() === action.payload.title.toLowerCase()
        );

    //console.log(account)
    globalState().set({ account });
};

const popupUpdate = (state, action) => {
    // TODO: should be keeping track of account here as "OLD_ACCOUNT"
    // INSTEAD OF HAVING TO CONSTANTLY SEARCH LIST FOR ACCOUNT IN POPUP
};

function selectAccountClick(state, action) {
    const accounts = clone(globalState().accounts);
    const newSelected = accounts.liabilities
        .filter(x => x.title === action.payload.title);
    const selected = [...clone(globalState().selected || []), ...newSelected];

    globalState().set({ selected });
}

// -----------------------------------------------------------------------------

function root(state = null, action) {
    //console.log(`--- root runs: ${action.type}`);
    switch (action.type) {
        case 'RECEIVE_ACCOUNTS':
            receiveAccounts(state, action);
            break;
        case 'RECEIVE_ACCOUNTS_DATA':
            receiveAccountsData(state, action);
            break;
        case 'GROUP_REMOVE':
            groupRemove(state, action);
            break;
        case 'ACCOUNT_SAVE':
            //accountSave(state, action);
            break;
        // from popup reducer
        case 'POPUP_ACCOUNT':
            popupAccount(state, action);
            break;
        case 'POPUP_UPDATE':
            popupUpdate(state, action);
            break;
        case 'SELECT_ACCOUNT_CLICK':
            selectAccountClick(state, action, root);
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


function bind(reducer) {
    return (state, action) => {
        // the right way to do it => commented out
        //const {accounts, account} = globalState();
        //return reducer(state, action, {accounts, account});

        return reducer(state, action, globalState());
    };
}

root.bind = bind;
root.globalState = globalState;

export default root;
