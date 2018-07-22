/*

this reducer should be divided in three:

    1) liabilities
    2) assets
    3) totals

this should be more simple
    global state -> object with 3 properties for each of the above
    each property should only have enough to feed UI in one pass

    list items should either
        1) loading
        2) account details (title, date, amount, total_owed, type, status)

*/
import {
    saveAccounts
} from '../js/redux/services';

import {
    clone,
    safeClone,
    safeAccess
} from '../js/react/utilities';

import {
    popupAccount,
    popupUpdate,
    removeItem
} from './popup';

import {
    updateGroupFromChildren, fixTotals,
    markGroupedItems, openGroupedAccounts,
    bumpDateOneMonth, bumpDateOneMonthBack,
    statToNumber
} from './helpers/group';

/*

   _  _  _       _  _  _  _    _  _  _  _
  (_)(_)(_) _   (_)(_)(_)(_)_ (_)(_)(_)(_)_
   _  _  _ (_)  (_)        (_)(_)        (_)
 _(_)(_)(_)(_)  (_)        (_)(_)        (_)
(_)_  _  _ (_)_ (_) _  _  _(_)(_) _  _  _(_)
  (_)(_)(_)  (_)(_)(_)(_)(_)  (_)(_)(_)(_)
                (_)           (_)
                (_)           (_)

*/

function receiveAccounts(state, action, root){
    var newState;
    if(action.payload.error){
        newState = Object.assign({}, state, action.payload);
        return newState;
    }
    newState = clone(action.payload) || {};
    (newState.liabilities || []).forEach(x => {
        if (x.hidden === 'false') {
            x.hidden = false;
        }
    });
    newState = updateGroupFromChildren(newState);
    newState.totals = safeAccess(() => state.totals) || {};
    newState.totals.balance = safeAccess(() => state.totals.balance) || 0;
    newState.totals.updating = true;
    newState = fixTotals(newState);
    newState = openGroupedAccounts(newState.accounts, state && !state.error ? state : newState);

    if(state && typeof state.selectedMenuIndex === "undefined"){
        newState.selectedMenuIndex = window && window.localStorage
            ? Number(localStorage.getItem('selectedTab'))
            : 0;
    } else {
        newState.selectedMenuIndex = state ? state.selectedMenuIndex : 0;
    }
    //newState.accounts = action.payload;
    return newState;
}

function receiveAccountsData(state, action, root){
    var newState;
    if(action.payload.error){
        newState = Object.assign({}, state, action.payload);
        return newState;
    }
    newState = clone(state);
    const balance = safeAccess(() => action.payload.data.accounts[0].balance);
    newState.totals = newState.totals || {};
    newState.totals.balance = Number(balance || 0);
    newState.totals.updating = false;

    // newState.accounts.totals = newState.accounts.totals || {};
    // newState.accounts.totals.balance = Number(balance || 0);
    // newState.accounts.totals.updating = false;
    newState.error = false;

    return newState;
}

function receiveAccountsSave(state, action, root){
    var newState;
    if(action.payload.error){
        newState = Object.assign({}, state, action.payload);
        return newState;
    }
    // console.log('got accounts save, notify if an error');
    newState = clone(state);
    newState.error = false;
    return newState;
}

function menuSelect(state, action, root){
    var newState;
    localStorage.setItem('selectedTab', action.payload);
    const selectedMenuIndex = action.payload;
    newState = clone(state);
    newState.selectedMenuIndex = selectedMenuIndex;
    //newState.liabilities.forEach(x => x.selected = false);
    return newState;
}

function selectAccountClick(state, action, root){
    var newState;
    newState = clone(state);

    //TODO: probably lame and should go away, should probably be newState.liabilities
    const liabs = newState.liabilities;

    liabs.forEach(liab => {
        if (liab.title === action.payload.title) {
            liab.selected = !liab.selected;
        }
    });
    newState.selected = liabs.filter(x => x.selected).map(x => x.title);
    return newState;
}

function groupClick(state, action, root){
    //console.log({state, action, root});
    var newState;
    const groupTitle = action.payload.title;
    //const group = (state.liabilities.filter(x => x.title === groupTitle) || [])[0];

    newState = clone(state);
    newState.liabilities = newState.liabilities.map(x =>{
        if (x.title.toLowerCase() === groupTitle.toLowerCase()){
            x.open = typeof x.open !== 'undefined' ? !x.open : true;
        }
        return x;
    });
    //console.log(root)
    newState = openGroupedAccounts(root.accounts, newState);

    // toggle open/closed
    //newState = switchGroup(group, state, accounts, !group.open)
    return newState;
}

function groupRemove(state, action, root){
    var newState = clone(state);

    newState.accounts = root ? clone(root.accounts) : {};

    //TODO: should do this in root reducer
    saveAccounts({
        assets: newState.accounts.assets,
        liabilities: newState.accounts.liabilities,
        balance: newState.accounts.balance
    });
    newState.assets = root
        ? clone(safeAccess(() => root.accounts.assets) || [])
        : [];
    newState.liabilities = root
        ? clone(safeAccess(() => root.accounts.liabilities) || [])
        : [];
    newState.account = undefined;

    newState = markGroupedItems(newState);
    newState = openGroupedAccounts(newState.accounts, newState);

    return newState;
}

function app(state, action, root) {
    //console.log(`--- app runs: ${action.type}`);
    var newState = undefined;
    //var groupedItems = undefined;
    switch (action.type) {
        case 'RECEIVE_ACCOUNTS':
            newState = receiveAccounts(state, action, root);
            break;
        case 'RECEIVE_ACCOUNTS_DATA':
            newState = receiveAccountsData(state, action, root);
            break;
        case 'RECEIVE_ACCOUNTS_SAVE':
            newState = receiveAccountsSave(state, action, root);
            break;
        case 'MENU_SELECT':
            newState = menuSelect(state, action, root);
            break;
        case 'SELECT_ACCOUNT_CLICK':
            newState = selectAccountClick(state, action, root);
            break;
        case 'GROUP_CLICK':
            newState = groupClick(state, action, root);
            break;
        case 'GROUP_REMOVE':
            newState = groupRemove(state, action, root);
            break;
        case 'ACCOUNT_SAVE':
            // get accounts from root state
            // TODO: should be in loading state (probably)
            newState = safeClone(() => state) || {};
            //newState.account = safeClone(() => root.account);
            //newState.accounts = safeClone(() => root.accounts);
            newState.liabilities = safeClone(() => root.accounts.liabilities);
            newState.assets = safeClone(() => root.accounts.assets);
            break;
        // from popup reducer
        // case 'POPUP_ACCOUNT':
        //     newState = popupAccount(state, action, root);
        //     break;
        // case 'POPUP_UPDATE':
        //     newState = popupUpdate(state, action, root);
        //     break;
        // case 'REMOVE_ITEM':
        //     newState = removeItem(state, action, root);
        //     break;
        // end popup reducer
        default:
            newState = clone(state || {});
            (newState.liabilities || []).forEach(x => x.selected = false);
    }

    return newState || state || {};
}

export default app;
export {
    receiveAccounts, receiveAccountsData, receiveAccountsSave, menuSelect,
    selectAccountClick, groupClick, groupRemove
};
