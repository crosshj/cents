// Reducer
var accounts = undefined;
var account = undefined;

function app(state, action) {
    var newState = undefined;
    switch (action.type) {
        case 'GET_ACCOUNTS':
            accounts = action.payload;
            var stateAccounts = JSON.parse(JSON.stringify(action.payload))
            stateAccounts.liabilities = stateAccounts.liabilities
                .filter(x => !x.hidden && x.type !== 'grouped');
            stateAccounts.selectedMenuIndex = localStorage && localStorage.getItem('selectedTab') || 0;
            newState = stateAccounts;
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
            
            const statToNumber = {
                due: 0,
                pending: 1,
                paid: 2
            };
            const groupedItems = group.items
                .map(item => (accounts.liabilities.filter(x => x.title === item.title)||[])[0])
                .sort(function (a, b) {
                    var statCompare = 0;
                    if (statToNumber[a.status] > statToNumber[b.status]) statCompare = 1;
                    if (statToNumber[a.status] < statToNumber[b.status]) statCompare = -1;
                
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
            console.log('Remove group here: ', account.title);

            break;
        case 'ACCOUNT_SAVE':
            console.log('Save account here: ', account.title);
            account=undefined;
            break;
        default:
            // de-select account if selected
            newState = JSON.parse(JSON.stringify(state||{}));
            (newState.liabilities||[]).forEach(x => x.selected = false);
        }

    return newState || state || {};
}

function popup(state, action) {
    var newState = undefined;
    var history = undefined;

    switch (action.type) {
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
            break;
        case 'POPUP_NEW_GROUP':
            var selected = accounts.liabilities.filter(a => a.selected);
            account = {
                type: "group",
                hidden: false,
                title: "New Group",
                note: "",
                items: selected,
                isNew: true,
                status: "paid",
                date: "2017-10-18",
                amount: selected.reduce((all, g) => { return all+Number(g.amount); }, 0),
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
                date: "2017-10-18",
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
            newState = Object.assign({}, state, {error: 'not initialized', account: undefined})
            break;
        case 'POPUP_HISTORY':
            const { field } = action.payload;
            history = { field, title: (account||{}).title };
            newState = Object.assign({}, state, {account, history, error: false})
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
            newState = Object.assign({}, state, {error: 'not initialized', account: undefined})
            break;
    }
    return newState || state || {};
}

export default { app, popup };