import {
    saveAccounts as serviceSaveAccounts
} from '../../js/redux/services';

import {
    safeClone
} from '../../js/react/utilities';

import {
    updateGroupFromChildren,
    fixTotals,
    markGroupedItems,
    openGroupedAccounts
} from './group';

function accountSave(state, action, root){
    // this should not be happening in app reducer
    // app should only see accounts and not worry about account changes
    // for the time being, will add account from popup to app state

    var newState;
    //console.log('~~~~~', state)
    // add account/group, or remove group
    newState = safeClone(() => state);

    const newStateAccount = newState.account || newState.popup.account;
    var newStateAccounts = newState.accounts || newState.app;
    
    if (!newStateAccount){
        console.log('%%%%%%%% >  NO ACCOUNT!!!');
        console.log(JSON.stringify(newState, null, '   '));
        return state;
    }
    
    if (newStateAccount.isNew) {
        const newAccount = safeClone(() => newStateAccount);
        delete newAccount.isNew;
        newAccount.items = (newAccount.items || []).map(x => ({ title: x.title }));
        groupedItems = (newStateAccount.items || [])
            .map(item => (newStateAccounts.liabilities.filter(x => x.title === item.title) || [])[0]);
        const groupStatus = groupedItems.reduce((status, g) => {
            status = g.status.toLowerCase() === 'due' ? 'due' : status;
            status = g.status.toLowerCase() === 'pending' && status !== 'due'
                ? 'pending'
                : status;
            return status;
        }, newAccount.status);
        newAccount.status = groupStatus;
        newStateAccounts.liabilities.push(newAccount);
        newStateAccounts.liabilities = newStateAccounts.liabilities
            .sort(function (a, b) {
                var statCompare = 0;
                if (statToNumber[a.status.toLowerCase()] > statToNumber[b.status.toLowerCase()]) statCompare = 1;
                if (statToNumber[a.status.toLowerCase()] < statToNumber[b.status.toLowerCase()]) statCompare = -1;

                return statCompare || new Date(a.date) - new Date(b.date);
            });
        groupedItems
            .forEach(x => x.type = 'grouped');
    } else {
        [].concat((newStateAccounts.liabilities||[]), (newStateAccounts.assets||[])).forEach(a => {
            //console.log(newStateAccount);
            if ((newStateAccount.oldTitle && a.title.toLowerCase() === newStateAccount.oldTitle.toLowerCase())
                || a.title.toLowerCase() === newStateAccount.title.toLowerCase()
            ) {
                Object.keys(newStateAccount).forEach(key => {
                    if(key === 'oldTitle') return;
                    a[key] = newStateAccount[key];
                });
            }
            a.type === 'group' && [].concat((newState.liabilities||[]), (newState.assets||[])).forEach(b => {
                if(a.title.toLowerCase() === b.title.toLowerCase()){
                    a.open = b.open;
                }
                // grouped account changed title
                a.items.forEach(i => {
                    if(newStateAccount.oldTitle && i.title.toLowerCase() === newStateAccount.oldTitle.toLowerCase()){
                        i.title = newState.account.title;
                    }
                });
            });
        });
    }
    const accounts = safeClone(() => newStateAccounts);
    newState = safeClone(() => newStateAccounts);
    newStateAccounts = accounts;
    newState = updateGroupFromChildren(newState);
    newState = fixTotals(newState);
    newState.selectedMenuIndex = state.selectedMenuIndex;

    //TODO: not sure that both of these are required
    newStateAccounts = markGroupedItems(newStateAccounts); //this may be done on server
    newState = markGroupedItems(newState);

    newState = openGroupedAccounts(newStateAccounts, newState);

    // removes view state from save state
    [].concat((newStateAccounts.liabilities||[]), (newStateAccounts.assets||[])).forEach(a => {
        delete a.open;
    });

    var _accounts = {
        assets: newStateAccounts.assets,
        liabilities: newStateAccounts.liabilities,
        balance: newStateAccounts.balance
    };
    newState.accounts = _accounts;
    newState.error = false;
    serviceSaveAccounts(_accounts);
    newState.liabilities = newState.liabilities.filter(x=>!!x);
    newState.liabilities.forEach(g => {
        if(g.items && g.items.length){
            g.items = g.items.map(i=> ({title: i.title}));
        }
    });
    delete newState.account;
    // TODO: this is lame, fix it later
    if(root){
        root.set({ accounts: _accounts });
    }

    return newState;
}

export {
   accountSave
};
