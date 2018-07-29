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

export {
    updateAccountsFromAccount,
    fixTotals
};
