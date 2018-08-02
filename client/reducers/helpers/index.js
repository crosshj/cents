import { clone  } from '../../js/react/utilities';

function updateAccountsFromAccount({accounts, account}){
    const _accounts = clone(accounts);

    const foundAccount = _accounts.liabilities.find(x => {
        // TODO: gettting based on title is kinda weak, tokenize in future
        return [
            account.title.toLowerCase(),
            (account.oldTitle || '').toLowerCase()
        ].includes(
            x.title.toLowerCase()
        );
    });

    const newAccount = account.isNew
        ? clone(account)
        : undefined;

    const _account = newAccount || foundAccount;

    try {
        delete _account.isNew;
        delete _account.oldTitle;
    } catch (e) {
        // do nothing
    }

    if(newAccount){
        _accounts.liabilities.push(_account);
    }
    if(foundAccount) {
        // add or set prop to equal incoming account
        Object.keys(_account)
            .forEach(key => {
                _account[key] = account[key];
            });
        // remove keys that popup does not have
        Object.keys(account)
            .forEach(key => {
                if(Object.keys(account).includes(key)) return;
                delete account[key];
            });
    }

    //TODO: update _accounts.totals as well

    return _accounts;
}

function fixTotals(accounts) {
    var u = clone(accounts);
    (u.accounts.liabilities || []).forEach(x => {
        if (x.hidden === 'false') {
            x.hidden = false;
        }
    });

    u.totals = u.totals || {};

    var pending = (u.accounts.liabilities || [])
        .filter(function (a) {
            return a.status && a.status.toLowerCase() === 'pending';
        }).sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });
    var paid = (u.accounts.liabilities||[])
        .filter(function (a) {
            return a.status && a.status.toLowerCase() === 'paid';
        }).sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });
    var due = (u.accounts.liabilities || [])
        .filter(function (a) {
            return a.status && a.status.toLowerCase() === 'due';
        }).sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });

    u.totals.pendingTotal = pending
        .filter(item => !(item.hidden || (item.type||'').includes('group')) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.dueTotal = due
        .filter(item => !(item.hidden || (item.type||'').includes('group')) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.assetsTotal = (u.accounts.assets || [])
        .filter(item => !JSON.parse(item.hidden) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.debts = (u.accounts.liabilities || [])
        .filter(item => !(item.hidden || (item.type||'').includes('group')) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.debtsTotal = (u.accounts.liabilities || [])
        .filter(item => !(item.hidden || (item.type||'').includes('group')) && item.total_owed)
        .reduce((all, one) => all + Number(one.total_owed), 0)
        .toFixed(2);

    return u;
}

function addSeperators(accounts){
    const newAccounts = clone(accounts);

    const addSeps = section => {
        const defs = section.filter(x => (x.type||'').includes('seperator-def'));
        // find range of dates for accounts

        // create seperators in range:  [accounts] / [seperator] / [accounts] / [seperator]

        // if first seperator is before all accounts, throw it away

        // only one seperator should exist after all accounts

        // sort accounts and seperators by date/name, seperators fall last in sort
    };
    [newAccounts.assets||[], newAccounts.liabilities||[]]
        .forEach(section => addSeps(section));

    return newAccounts;
}

export {
    updateAccountsFromAccount,
    fixTotals,
    addSeperators
};
