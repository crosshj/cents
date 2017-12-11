// Reducer
var accounts = undefined;
var account = undefined;

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
        case 'SELECT_ACCOUNT_CLICK':
            newState = Object.assign({}, state, {});
            newState.liabilities.forEach(liab => {
                if(liab.title === action.payload.title){
                    liab.selected = !liab.selected;
                }
            });
            break;
        case 'GROUP_CLICK':
            newState = Object.assign({}, state, {});
            console.log('should insert inline grouped items here');
            break;
        case 'GROUP_REMOVE':
            console.log('Remove group here: ', account.title);

            break;
        case 'ACCOUNT_SAVE':
            console.log('Save account here: ', account.title);
            account=undefined;
            break;
        }
        
    return newState || state || {};
}

function popup(state, action) {
    var newState = undefined;

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