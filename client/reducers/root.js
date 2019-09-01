import { clone, safeAccess } from '../helpers/utilities';
import { updateAccountsFromAccount } from './helpers';

import {
    saveAccounts
} from '../redux/services';
import { fixTotals } from './helpers';

/*

root reducer:

1) do not output except from bind to another reducer
2) input only comes from actions

*/
var _account = undefined;
var _accounts = undefined;
var _selected = undefined;

window.MAIN_DATA = {
    get: () => ({
        account: _account,
        accounts: _accounts,
        selected: _selected
    })
};

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
        _selected = undefined;
    }
});

// -----------------------------------------------------------------------------
const receiveAccounts = (state, action) => {
    //debugger;
    const accounts = clone(action.payload);
    const totals = fixTotals(accounts).totals;
    accounts.totals = totals;
    globalState().set({ accounts });
};

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
            .filter(x => (x.title || '').toLowerCase() === item.title.toLowerCase()) || [])[0]
        );
    groupedItems.forEach(x => delete x.type);

    accounts.liabilities = accounts.liabilities.filter(
        x => (x.title || '').toLowerCase() !== account.title.toLowerCase()
    );

    globalState().reset();
    globalState().set({ accounts });

    //TODO: maybe trigger accounts save here (service)
};

const popupAccount = (state, action) => {
    //console.log(action.payload.title)
    var accounts = clone(globalState().accounts);
    //console.log([].concat(accounts.liabilities || [], accounts.assets || []));
    var account = [].concat(accounts.liabilities || [], accounts.assets || [])
        .find(
            a => (a.title || '').toLowerCase() === action.payload.title.toLowerCase()
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
        .filter(x => (x.title || '') === action.payload.title);
    const selected = [...clone(globalState().selected || []), ...newSelected];

    globalState().set({ selected });
}

function accountSave(state, action) {
    var accounts = clone(globalState().accounts);
    var account = clone(state.popup.account);
    // account in state should be the original account state
    // account in popup should be the new account state

    // service needs to make net call to save changes on server
    // - when call is in progress
    //   - popup state should be same except with loading = true
    //   - account state stays the same
    //   - root state stays the same

    // - if call fails, popup needs to display error and ask for fix
    //   - root needs to keep same state
    //   - account needs to keep same state
    //   - popup state stays same except error is added

    // - if call succeeds, do the following:
    //   - popup needs to forget its account state
    //   - app needs to update its total and list
    //   - root needs to forget its account

    // currently client state does not wait for net call, so assume success
    //  - popup forgets its account state
    //  - app updates total and list (based on what action payload modified by root?)
    //  - root forgets its account, accounts gets updated in app reducer (LAME)

    action.payload = { account };

    accounts = updateAccountsFromAccount({ accounts, account });

    (accounts.liabilities || []).forEach(liab => {
        if (liab.type !== 'group') return;
        liab.items = (liab.items || []).map(i => {
            return typeof i === "string"
                ? { title: i }
                : { title: i.title };
        });
    });

    const totals = fixTotals(accounts, true).totals;
    accounts.totals = totals;
    //console.log({accounts})

    saveAccounts(accounts);

    globalState().reset();
    globalState().set({ accounts });
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
            accountSave(state, action);
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
        // case 'REMOVE_ITEM':
        //     removeItem(state, action);
        //     break;
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

        // switch (action.type) {
        //     case 'ACCOUNT_SAVE':
        //         console.log({ action });
        //         break;
        // }

        return reducer(state, action, globalState());
    };
}

root.bind = bind;
root.globalState = globalState;

export default root;
