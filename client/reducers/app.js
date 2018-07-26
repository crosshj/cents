import {
    saveAccounts
} from '../js/redux/services';

import {
    clone,
    safeAccess
} from '../js/react/utilities';

import {
    popupAccount,
    popupUpdate,
    removeItem
} from './popup';

// Reducer
const statToNumber = {
    due: 1,
    pending: 2,
    paid: 3
};

function updateGroupFromChildren(accounts) {
    var newAccounts = clone(accounts);
    var newLiabs = newAccounts.liabilities || [];
    var groups = newLiabs.filter(x => x.type === 'group') || [];
    groups.forEach(g => {
        const groupedItems = g.items
            .map(item => (newLiabs
                .filter(x => x.title.toLowerCase() === item.title.toLowerCase()) || []
            )[0])
            .filter(x => !!x);
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

    var pending = (u.liabilities || [])
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
    var due = (u.liabilities || [])
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

    u.totals.assetsTotal = (u.assets || [])
        .filter(item => !JSON.parse(item.hidden))
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.debts = (u.liabilities || [])
        .filter(item => !(item.hidden || item.type === 'group'))
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.debtsTotal = (u.liabilities || [])
        .filter(item => !(item.hidden || item.type === 'group'))
        .reduce((all, one) => all + Number(one.total_owed), 0)
        .toFixed(2);

    return u;
}

function markGroupedItems(accounts) {
    const newAccounts = clone(accounts);
    const groupedItems = Object.keys(newAccounts.liabilities
        .reduce((all, x) => {
            if (x.items) {
                x.items.forEach(y => {
                    if (!all[y.title.toLowerCase()]) {
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

function openGroupedAccounts(initialState, viewState) {
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
    //console.log(initialState)
    var newLiabs = [];
    outputState.liabilities.forEach(group => {
        newLiabs.push(group);
        if (!group.open || group.type !== 'group') return;

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

function bumpDateOneMonth(date) {
    var day = Number(date.replace(/.*-/g, ''));
    var month = Number(date.replace(/-..$/g, '').replace(/.*-/g, ''));
    var year = Number(date.replace(/-.*/g, ''));
    if (month === 12) {
        year += 1;
        month = 1;
    } else {
        month += 1;
    }
    day = (day < 10) ? '0' + day : day;
    month = (month < 10) ? '0' + month : month;
    return year + '-' + month + '-' + day;
}

function bumpDateOneMonthBack(date) {
    var day = Number(date.replace(/.*-/g, ''));
    var month = Number(date.replace(/-..$/g, '').replace(/.*-/g, ''));
    var year = Number(date.replace(/-.*/g, ''));
    if (month === 1) {
        year -= 1;
        month = 12;
    } else {
        month -= 1;
    }
    day = (day < 10) ? '0' + day : day;
    month = (month < 10) ? '0' + month : month;
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

function receiveAccounts(state, action, root) {
    var newState;
    if (action.payload.error) {
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

    if (state && typeof state.selectedMenuIndex === "undefined") {
        newState.selectedMenuIndex = window && window.localStorage
            ? Number(localStorage.getItem('selectedTab'))
            : 0;
    } else {
        newState.selectedMenuIndex = state ? state.selectedMenuIndex : 0;
    }
    newState.accounts = action.payload;
    return newState;
}

function receiveAccountsData(state, action, root) {
    var newState;
    if (action.payload.error) {
        newState = Object.assign({}, state, action.payload);
        return newState;
    }
    newState = clone(state);
    const balance = safeAccess(() => action.payload.data.accounts[0].balance);
    newState.totals = newState.totals || {};
    newState.totals.balance = Number(balance || 0);
    newState.totals.updating = false;

    newState.accounts.totals = newState.accounts.totals || {};
    newState.accounts.totals.balance = Number(balance || 0);
    newState.accounts.totals.updating = false;
    newState.error = false;

    return newState;
}

function receiveAccountsSave(state, action, root) {
    var newState;
    if (action.payload.error) {
        newState = Object.assign({}, state, action.payload);
        return newState;
    }
    // console.log('got accounts save, notify if an error');
    newState = clone(state);
    newState.error = false;
    return newState;
}

function menuSelect(state, action, root) {
    var newState;
    localStorage.setItem('selectedTab', action.payload);
    const selectedMenuIndex = action.payload;
    newState = clone(state);
    newState.selectedMenuIndex = selectedMenuIndex;
    //newState.liabilities.forEach(x => x.selected = false);
    return newState;
}

function selectAccountClick(state, action, { selected = [] }) {
    const newState = clone(state);
    newState.accounts.liabilities.forEach(l => {
        l.selected = selected.map(x => x.title).includes(l.title);
    });
    //newState.selected = selected.map(x => x.title);
    return newState;
}

function groupClick(state, action, root) {
    //console.log({state, action, root});
    var newState;
    const groupTitle = action.payload.title;
    //const group = (state.liabilities.filter(x => x.title === groupTitle) || [])[0];

    newState = clone(state);
    newState.liabilities = newState.liabilities.map(x => {
        if (x.title.toLowerCase() === groupTitle.toLowerCase()) {
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

function groupRemove(state, action, root) {
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

function accountSave(state, action, root) {
    var newState;
    //console.log('~~~~~', state)
    // add account/group, or remove group
    newState = clone(state);

    if (!newState.account) {
        return state;
    }

    if (newState.account.isNew) {
        const newAccount = clone(newState.account);
        delete newAccount.isNew;
        newAccount.items = (newAccount.items || []).map(x => ({ title: x.title }));
        groupedItems = (newState.account.items || [])
            .map(item => (newState.accounts.liabilities.filter(x => x.title === item.title) || [])[0]);
        const groupStatus = groupedItems.reduce((status, g) => {
            status = g.status.toLowerCase() === 'due' ? 'due' : status;
            status = g.status.toLowerCase() === 'pending' && status !== 'due'
                ? 'pending'
                : status;
            return status;
        }, newAccount.status);
        newAccount.status = groupStatus;
        newState.accounts.liabilities.push(newAccount);
        newState.accounts.liabilities = newState.accounts.liabilities
            .sort(function (a, b) {
                var statCompare = 0;
                if (statToNumber[a.status.toLowerCase()] > statToNumber[b.status.toLowerCase()]) statCompare = 1;
                if (statToNumber[a.status.toLowerCase()] < statToNumber[b.status.toLowerCase()]) statCompare = -1;

                return statCompare || new Date(a.date) - new Date(b.date);
            });
        groupedItems
            .forEach(x => x.type = 'grouped');
    } else {
        [].concat((newState.accounts.liabilities || []), (newState.accounts.assets || [])).forEach(a => {
            //console.log(newState.account);
            if ((newState.account.oldTitle && a.title.toLowerCase() === newState.account.oldTitle.toLowerCase())
                || a.title.toLowerCase() === newState.account.title.toLowerCase()
            ) {
                Object.keys(newState.account).forEach(key => {
                    if (key === 'oldTitle') return;
                    a[key] = newState.account[key];
                });
            }
            a.type === 'group' && [].concat((newState.liabilities || []), (newState.assets || [])).forEach(b => {
                if (a.title.toLowerCase() === b.title.toLowerCase()) {
                    a.open = b.open;
                }
                // grouped account changed title
                a.items.forEach(i => {
                    if (newState.account.oldTitle && i.title.toLowerCase() === newState.account.oldTitle.toLowerCase()) {
                        i.title = newState.account.title;
                    }
                });
            });
        });
    }
    const accounts = clone(newState.accounts);
    newState = clone(newState.accounts);
    newState.accounts = accounts;
    newState = updateGroupFromChildren(newState);
    newState = fixTotals(newState);
    newState.selectedMenuIndex = state.selectedMenuIndex;

    //TODO: not sure that both of these are required
    newState.accounts = markGroupedItems(newState.accounts); //this may be done on server
    newState = markGroupedItems(newState);

    newState = openGroupedAccounts(newState.accounts, newState);

    // removes view state from save state
    [].concat((newState.accounts.liabilities || []), (newState.accounts.assets || [])).forEach(a => {
        delete a.open;
    });

    var _accounts = {
        assets: newState.accounts.assets,
        liabilities: newState.accounts.liabilities,
        balance: newState.accounts.balance
    };
    newState.accounts = _accounts;
    newState.error = false;
    saveAccounts(_accounts);
    newState.liabilities = newState.liabilities.filter(x => !!x);
    newState.liabilities.forEach(g => {
        if (g.items && g.items.length) {
            g.items = g.items.map(i => ({ title: i.title }));
        }
    });
    delete newState.account;
    // TODO: this is lame, fix it later
    if (root) {
        root.set({ accounts: _accounts });
    }

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
            newState = accountSave(state, action, root);
            break;


        //TODO: should not be keeping track of this here!!!
        // from popup reducer
        case 'POPUP_ACCOUNT':
            newState = popupAccount(state, action, root);
            break;
        case 'POPUP_UPDATE':
            newState = popupUpdate(state, action, root);
            break;
        case 'REMOVE_ITEM':
            newState = removeItem(state, action, root);
            break;
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
    selectAccountClick, groupClick, groupRemove, accountSave
};
