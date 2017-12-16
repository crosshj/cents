import {
    fetchHistory,
    saveAccounts
} from './services';
import { safeAccess } from '../react/utilities';

// Reducer
var accounts = undefined;
var account = undefined;
var selected = undefined;

const statToNumber = {
    due: 1,
    pending: 2,
    paid: 3
};

function app(state, action) {
    var newState = undefined;
    var groupedItems = undefined;
    switch (action.type) {
        case 'RECEIVE_ACCOUNTS':
            accounts = action.payload;
            var stateAccounts = JSON.parse(JSON.stringify(action.payload))
            stateAccounts.liabilities = (stateAccounts.liabilities||[])
                .filter(x => !x.hidden && x.type !== 'grouped');
            stateAccounts.selectedMenuIndex = localStorage && localStorage.getItem('selectedTab') || 0;
            newState = stateAccounts;
            break;
        case 'RECEIVE_ACCOUNTS_DATA':
            newState = JSON.parse(JSON.stringify(state));
            const balance = safeAccess(() => action.payload.data.accounts[0].balance);
            newState.totals = newState.totals || {};
            newState.totals.balance = Number(balance||0);
            break;
        case 'RECEIVE_ACCOUNTS_SAVE':
            // console.log('got accounts save, notify if an error');
            newState = JSON.parse(JSON.stringify(state));
            break;
        case 'MENU_SELECT':
            localStorage.setItem('selectedTab', action.payload);
            const selectedMenuIndex = action.payload;
            newState = Object.assign({}, state, {selectedMenuIndex});
            newState.liabilities.forEach(x => x.selected = false);
            break;
        case 'SELECT_ACCOUNT_CLICK':
            newState = Object.assign({}, state, {});
            newState.liabilities.forEach(liab => {
                if(liab.title === action.payload.title){
                    liab.selected = !liab.selected;
                }
            });
            selected = newState.liabilities.filter( x=> x.selected);
            break;
        case 'GROUP_CLICK':
            newState = JSON.parse(JSON.stringify(state));
            const group = (newState.liabilities.filter(x => x.title === action.payload.title)||[])[0];
            newState.liabilities.forEach(x => x.selected = false);
            newState.liabilities = newState.liabilities.filter(x => x.type !== 'grouped');
            if(group.open){
                group.open = false;
                break;
            } 

            groupedItems = group.items
                .map(item => (accounts.liabilities.filter(x => x.title === item.title)||[])[0])
                .sort(function (a, b) {
                    var statCompare = 0;
                    if (statToNumber[a.status.toLowerCase()] > statToNumber[b.status.toLowerCase()]) statCompare = 1;
                    if (statToNumber[a.status.toLowerCase()] < statToNumber[b.status.toLowerCase()]) statCompare = -1;
                
                    return statCompare || new Date(a.date) - new Date(b.date);
                });
            var newLiabs = [];
            newState.liabilities.forEach(item => {
                newLiabs.push(item);
                if(item.title === action.payload.title){
                    newLiabs = newLiabs.concat(groupedItems);
                    item.open = true;
                }
            });
            newState.liabilities = newLiabs;
            break;
        case 'GROUP_REMOVE':
            // console.log('Remove group here: ', account.title);
            groupedItems = account.items
                .map(item => (accounts.liabilities.filter(x => x.title.toLowerCase() === item.title.toLowerCase())||[])[0]);
            groupedItems.forEach(x=> x.type = undefined);
            accounts.liabilities = accounts.liabilities.filter(x => x.title.toLowerCase() !== account.title.toLowerCase());
            saveAccounts({
                assets: accounts.assets,
                liabilities: accounts.liabilities,
                balance: accounts.balance
            });
            newState = JSON.parse(JSON.stringify(state));
            newState.liabilities = accounts.liabilities
                .filter(x => !x.hidden && x.type !== 'grouped');
            break;
        case 'ACCOUNT_SAVE':
            const liabs = accounts.liabilities.map(x=>x.title.toLowerCase());
            // add account/group, or remove group
            if(account.isNew){
                const newAccount = JSON.parse(JSON.stringify(account));
                delete newAccount.isNew;
                newAccount.items = (newAccount.items||[]).map(x => ({ title: x.title}));
                groupedItems = (account.items||[])
                    .map(item => (accounts.liabilities.filter(x => x.title === item.title)||[])[0]);
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
                accounts.liabilities.forEach(a => {
                    if(a.title.toLowerCase() === account.title.toLowerCase()){
                        Object.keys(account).forEach(key => a[key] = account[key]);
                    }
                });
            }
            newState = JSON.parse(JSON.stringify(state));
            newState.liabilities = accounts.liabilities
                .filter(x => !x.hidden && x.type !== 'grouped');
            saveAccounts({
                assets: accounts.assets,
                liabilities: accounts.liabilities,
                balance: accounts.balance
            });
            // QUESTION: will this always be processed before popup reducer?
            account=undefined;
            break;
        default:
            newState = JSON.parse(JSON.stringify(state||{}));
            (newState.liabilities||[]).forEach(x => x.selected = false);
        }

    return newState || state || {};
}

function popup(state, action) {
    var newState = undefined;
    var history = undefined;

    switch (action.type) {
        case 'RECEIVE_HISTORY':
            // debugger;
            newState = JSON.parse(JSON.stringify(state));
            newState.history.error = false;
            newState.history.data = action.payload;
            break;
        case 'POPUP_ACCOUNT':
            account = accounts.liabilities
                .filter(a => a.title.toLowerCase() === action.payload.title.toLowerCase());
            account = account[0];
            newState = Object.assign({}, state, {
                error: account ? false : 'could not find account',
                account: JSON.parse(JSON.stringify(account || false))
            });
            break;
        case 'POPUP_UPDATE':
            newState = JSON.parse(JSON.stringify(state));
            Object.keys(action.payload)
                .forEach(fieldName => newState.account[fieldName] = action.payload[fieldName]);
            account = newState.account;
            break;
        case 'POPUP_NEW_GROUP':
            var selectedAmount = selected.reduce((all, g) => { return all+Number(g.amount); }, 0);
            selectedAmount = parseFloat(selectedAmount).toFixed(2);
            var selectedOwed = selected.reduce((all, g) => { return all+Number(g.total_owed||0); }, 0);
            selectedOwed = parseFloat(selectedOwed).toFixed(2);
            var selectedLatestDate = selected
                .map(x=>x.date)
                .sort(function (a, b) {
                    return new Date(a.date) - new Date(b.date);
                })[0];
            account = {
                type: "group",
                hidden: false,
                title: "New Group",
                note: "",
                items: selected,
                isNew: true,
                status: "paid", // TODO: update from selected accounts
                date: selectedLatestDate,
                amount: selectedAmount,
                total_owed: selected.reduce((all, g) => { return all+Number(g.total_owed||0); }, 0),
                auto: false
            };
            newState = Object.assign({}, state, {
                error: false,
                account: JSON.parse(JSON.stringify(account || false))
            });
            break;
        case 'POPUP_NEW_ACCOUNT':
            account = {
                type: "",
                hidden: false,
                title: "New Group",
                note: "",
                isNew: true,
                status: "paid",
                date: "2017-10-18", //TODO: a month from now?
                amount: 0,
                total_owed: 0,
                auto: false
            };
            newState = Object.assign({}, state, {
                error: false,
                account: JSON.parse(JSON.stringify(account || false))
            });
            break;
        case 'POPUP_CANCEL':
            account = undefined;
            history = undefined;
            newState = Object.assign({}, state, {error: 'not initialized', account, history})
            break;
        case 'POPUP_HISTORY':
            const { field } = action.payload;
            const title = (account||{}).title || 'Total Owed';
            history = { error: 'loading', field, title };
            newState = Object.assign({}, state, {account, history, error: false});
            const type = account ? 'liabilities' : 'balance'; //TODO: get type in a better way
            fetchHistory({ type, title, field });
            break;
        case 'POPUP_HISTORY_BACK':
            history = undefined;
            newState = Object.assign({}, state, {account, history, error: false})
            break;
        case 'GROUP_REMOVE':
            account=undefined;
            newState = Object.assign({}, state, {error: 'not initialized', account: undefined})
            break;
        case 'ACCOUNT_SAVE':
            newState = Object.assign({}, state, {error: 'not initialized', account: undefined});
            break;
    }
    return newState || state || {};
}

export default { app, popup };