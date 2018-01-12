import {
    fetchHistory,
    saveAccounts
} from './services';

import { safeAccess } from '../react/utilities';

import {
    popupAccount,
    popupUpdate,
    removeItem
} from '../../reducers/popup';

// Reducer
var accounts = undefined;
var account = undefined;
var selected = undefined;
var dateDirty = false;

const statToNumber = {
    due: 1,
    pending: 2,
    paid: 3
};

function clone(item) {
    return JSON.parse(JSON.stringify(item));
}

function updateGroupFromChildren(accounts) {
    var newAccounts = clone(accounts);
    var newLiabs = newAccounts.liabilities || [];
    var groups = newLiabs.filter(x => x.type === 'group') || [];
    groups.forEach(g => {
        const groupedItems = g.items
            .map(item => (newLiabs
                .filter(x => x.title.toLowerCase() === item.title.toLowerCase()) || []
            )[0]);
        if (!groupedItems[0]) {
            return;
        }
        g.total_owed = groupedItems
            .map(x => x.total_owed)
            .reduce((total, z) => Number(total) + Number(z), 0);
        g.status = groupedItems
            .map(x => x.status)
            .reduce((status, z) => statToNumber[status.toLowerCase()] < statToNumber[z.toLowerCase()]
                ? status.toLowerCase()
                : z.toLowerCase()
            , 'paid');
        g.amount = groupedItems
            .map(x => x.amount)
            .reduce((total, z) => Number(total) + Number(z), 0);
        g.date = groupedItems
            .map(x => x.date)
            .sort(function (a, b) {
                return new Date(a) - new Date(b);
            })[0];
    });
    newAccounts.liabilities = newLiabs;

    return newAccounts;
}

function fixTotals(accounts) {
    var u = clone(accounts);
    (u.liabilities || []).forEach(x => {
        if (x.hidden === 'false') {
            x.hidden = false;
        }
    });

    u.totals = u.totals || {};

    var pending = (u.liabilities||[])
        .filter(function (a) {
            return a.status && a.status.toLowerCase() === 'pending';
        }).sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });
    // var paid = (u.liabilities||[])
    //     .filter(function (a) {
    //         return a.status && a.status.toLowerCase() === 'paid';
    //     }).sort(function (a, b) {
    //         return new Date(a.date) - new Date(b.date);
    //     });
    var due = (u.liabilities||[])
        .filter(function (a) {
            return a.status && a.status.toLowerCase() === 'due';
        }).sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });

    u.totals.pendingTotal = pending
        .filter(item => !(item.hidden || item.type === 'group'))
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.dueTotal = due
        .filter(item => !(item.hidden || item.type === 'group'))
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.assetsTotal = (u.assets||[])
        .filter(item => !JSON.parse(item.hidden))
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.debts = (u.liabilities||[])
        .filter(item => !(item.hidden || item.type === 'group'))
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.debtsTotal = (u.liabilities||[])
        .filter(item => !(item.hidden || item.type === 'group'))
        .reduce((all, one) => all + Number(one.total_owed), 0)
        .toFixed(2);

    return u;
}

function markGroupedItems(accounts){
    const newAccounts = clone(accounts);
    const groupedItems = Object.keys(newAccounts.liabilities
        .reduce((all, x) => {
            if(x.items){
                x.items.forEach(y => {
                    if(!all[y.title.toLowerCase()]){
                        all[y.title.toLowerCase()] = y;
                    }
                });
            }
            return all;
        }, {}));
    newAccounts.liabilities.forEach(x => x.type !== 'group' ? delete x.type : undefined);
    newAccounts.liabilities.forEach(x => 
        x.type !== 'group' && groupedItems.includes(x.title.toLowerCase())
            ? x.type = 'grouped'
            : undefined
    );
    return newAccounts;
}

function openGroupedAccounts(initialState, viewState){
    const outputState = clone(viewState);

    // stupid "false"
    outputState.liabilities.forEach(
        x => x.hidden === "false" ? x.hidden = false : undefined
    );

    // remove grouped items
    outputState.liabilities = outputState.liabilities.filter(x => x.type !== 'grouped');

    // remove hidden items
    outputState.liabilities = outputState.liabilities.filter(x => !x.hidden);

    // add grouped items back if group open
    var newLiabs = [];
    outputState.liabilities.forEach(group => {
        newLiabs.push(group);
        if(!group.open || group.type !== 'group') return;

        const groupedItems = group.items
            .map(item => (initialState.liabilities.filter(x => x.title === item.title) || [])[0])
            .sort(function (a, b) {
                var statCompare = 0;
                if (statToNumber[a.status.toLowerCase()] > statToNumber[b.status.toLowerCase()]) statCompare = 1;
                if (statToNumber[a.status.toLowerCase()] < statToNumber[b.status.toLowerCase()]) statCompare = -1;

                return statCompare || new Date(a.date) - new Date(b.date);
            });

        newLiabs = newLiabs.concat(groupedItems);
    });

    outputState.liabilities = newLiabs;
    return outputState;
}

function bumpDateOneMonth(date){
    var day = Number(date.replace(/.*-/g,''));
    var month = Number(date.replace(/-..$/g,'').replace(/.*-/g,''));
    var year = Number(date.replace(/-.*/g,''));
    if (month === 12) {
        year += 1;
        month = 1;
    } else {
        month += 1;
    }
    day = (day < 10) ? '0'+day : day;
    month = (month < 10) ? '0'+month : month;
    return year + '-' + month + '-' + day;
}

function bumpDateOneMonthBack(date){
    var day = Number(date.replace(/.*-/g,''));
    var month = Number(date.replace(/-..$/g,'').replace(/.*-/g,''));
    var year = Number(date.replace(/-.*/g,''));
    if (month === 1) {
        year -= 1;
        month = 12;
    } else {
        month -= 1;
    }
    day = (day < 10) ? '0'+day : day;
    month = (month < 10) ? '0'+month : month;
    return year + '-' + month + '-' + day;
}

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

function app(state, action) {
    var newState = undefined;
    var groupedItems = undefined;
    switch (action.type) {
        case 'RECEIVE_ACCOUNTS':
            if(action.payload.error){
                newState = Object.assign({}, state, action.payload);
                break;
            }
            accounts = action.payload;
            var stateAccounts = clone(action.payload) || {};
            (stateAccounts.liabilities || []).forEach(x => {
                if (x.hidden === 'false') {
                    x.hidden = false;
                }
            });
            stateAccounts = updateGroupFromChildren(stateAccounts);
            stateAccounts.totals = safeAccess(() => state.totals) || {};
            stateAccounts.totals.balance = safeAccess(() => state.totals.balance) || 0;
            stateAccounts.totals.updating = true;
            stateAccounts = fixTotals(stateAccounts);
            stateAccounts = openGroupedAccounts(accounts, state && !state.error ? state : stateAccounts);

            if(state && typeof state.selectedMenuIndex === "undefined"){
                stateAccounts.selectedMenuIndex = window && window.localStorage
                    ? Number(localStorage.getItem('selectedTab'))
                    : 0;
            } else {
                stateAccounts.selectedMenuIndex = state ? state.selectedMenuIndex : 0;
            }
            newState = stateAccounts;
            newState.accounts = action.payload;
            break;
        case 'RECEIVE_ACCOUNTS_DATA': {
            if(action.payload.error){
                newState = Object.assign({}, state, action.payload);
                break;
            }
            newState = clone(state);
            const balance = safeAccess(() => action.payload.data.accounts[0].balance);
            newState.totals = newState.totals || {};
            newState.totals.balance = Number(balance || 0);
            newState.totals.updating = false;

            accounts.totals = accounts.totals || {};
            accounts.totals.balance = Number(balance || 0);
            accounts.totals.updating = false;
            break;
        }
        case 'RECEIVE_ACCOUNTS_SAVE':
            if(action.payload.error){
                newState = Object.assign({}, state, action.payload);
                break;
            }
            // console.log('got accounts save, notify if an error');
            newState = clone(state);
            break;
        case 'MENU_SELECT': {
            localStorage.setItem('selectedTab', action.payload);
            const selectedMenuIndex = action.payload;
            newState = Object.assign({}, state, { selectedMenuIndex });
            //newState.liabilities.forEach(x => x.selected = false);
            break;
        }
        case 'SELECT_ACCOUNT_CLICK':
            newState = Object.assign({}, state, {});
            newState.liabilities.forEach(liab => {
                if (liab.title === action.payload.title) {
                    liab.selected = !liab.selected;
                }
            });
            selected = newState.liabilities.filter(x => x.selected);
            break;
        case 'GROUP_CLICK': {
            const groupTitle = action.payload.title;
            //const group = (state.liabilities.filter(x => x.title === groupTitle) || [])[0];

            var alteredState = clone(state);
            alteredState.liabilities = alteredState.liabilities.map(x =>{
                if (x.title.toLowerCase() === groupTitle.toLowerCase()){
                    x.open = typeof x.open !== 'undefined' ? !x.open : true;
                }
                return x;
            });
            newState = openGroupedAccounts(accounts, alteredState);

            // toggle open/closed
            //newState = switchGroup(group, state, accounts, !group.open)
            break;
        }
        case 'GROUP_REMOVE':
            // console.log('Remove group here: ', account.title);
            groupedItems = account.items
                .map(item => (accounts.liabilities
                    .filter(x => x.title.toLowerCase() === item.title.toLowerCase()) || [])[0]
                );
            groupedItems.forEach(x => delete x.type);
            accounts.liabilities = accounts.liabilities.filter(x => x.title.toLowerCase() !== account.title.toLowerCase());
            saveAccounts({
                assets: accounts.assets,
                liabilities: accounts.liabilities,
                balance: accounts.balance
            });
            newState = Object.assign(clone(state), accounts);
            newState.liabilities = newState.liabilities
                .filter(x => x.title.toLowerCase() !== account.title.toLowerCase());
            newState = markGroupedItems(newState);
            newState = openGroupedAccounts(accounts, newState);

            break;
        case 'ACCOUNT_SAVE': {
            //console.log('~~~~~', state)
            // add account/group, or remove group
            if (account.isNew) {
                const newAccount = JSON.parse(JSON.stringify(account));
                delete newAccount.isNew;
                newAccount.items = (newAccount.items || []).map(x => ({ title: x.title }));
                groupedItems = ((account || state.account).items || [])
                    .map(item => (accounts.liabilities.filter(x => x.title === item.title) || [])[0]);
                const groupStatus = groupedItems.reduce((status, g) => {
                    status = g.status.toLowerCase() === 'due' ? 'due' : status;
                    status = g.status.toLowerCase() === 'pending' && status !== 'due'
                        ? 'pending'
                        : status;
                    return status;
                }, newAccount.status);
                newAccount.status = groupStatus;
                accounts.liabilities.push(newAccount);
                accounts.liabilities = accounts.liabilities
                    .sort(function (a, b) {
                        var statCompare = 0;
                        if (statToNumber[a.status.toLowerCase()] > statToNumber[b.status.toLowerCase()]) statCompare = 1;
                        if (statToNumber[a.status.toLowerCase()] < statToNumber[b.status.toLowerCase()]) statCompare = -1;

                        return statCompare || new Date(a.date) - new Date(b.date);
                    });
                groupedItems
                    .forEach(x => x.type = 'grouped');
            } else {
                [].concat((accounts.liabilities||[]), (accounts.assets||[])).forEach(a => {
                    if ((account.oldTitle && a.title.toLowerCase() === account.oldTitle.toLowerCase()) || a.title.toLowerCase() === account.title.toLowerCase()) {
                        Object.keys(account).forEach(key => {
                            if(key === 'oldTitle') return;
                            a[key] = account[key];
                        });
                    }
                    a.type === 'group' && [].concat((state.liabilities||[]), (state.assets||[])).forEach(b => {
                        if(a.title.toLowerCase() === b.title.toLowerCase()){
                            a.open = b.open;
                        }
                    });
                });
            }
            newState = clone(accounts);
            newState = updateGroupFromChildren(newState);
            newState = fixTotals(newState);
            newState.selectedMenuIndex = state.selectedMenuIndex;

            //TODO: not sure that both of these are required
            accounts = markGroupedItems(accounts); //this may be done on server
            newState = markGroupedItems(newState);
            
            newState = openGroupedAccounts(accounts, newState);

            // removes view state from save state
            [].concat((accounts.liabilities||[]), (accounts.assets||[])).forEach(a => {
                delete a.open
            });

            saveAccounts({
                assets: accounts.assets,
                liabilities: accounts.liabilities,
                balance: accounts.balance
            });
            // QUESTION: will this always be processed before popup reducer?
            //account = undefined;
            break;
        }
        case 'POPUP_ACCOUNT': {
            newState = popupAccount(state, action);
            account = newState.account;
            //console.log('=====', { account })
            break;
        }
        case 'POPUP_UPDATE': {
            newState = popupUpdate(state, action);
            account = newState.account;
            break;
        }
        case 'REMOVE_ITEM': {
            newState = removeItem(state, action);
            account = newState.account;
            break;
        }
        default:
            newState = JSON.parse(JSON.stringify(state || {}));
            (newState.liabilities || []).forEach(x => x.selected = false);
    }

    return newState || state || {};
}

import popup from '../../reducers/popup';

export default { app, popup };