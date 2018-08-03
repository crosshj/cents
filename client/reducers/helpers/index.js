import { clone } from '../../js/react/utilities';

function updateAccountsFromAccount({ accounts, account }) {
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

    if (newAccount) {
        _accounts.liabilities.push(_account);
    }
    if (foundAccount) {
        // add or set prop to equal incoming account
        Object.keys(_account)
            .forEach(key => {
                _account[key] = account[key];
            });
        // remove keys that popup does not have
        Object.keys(account)
            .forEach(key => {
                if (Object.keys(account).includes(key)) return;
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
    var paid = (u.accounts.liabilities || [])
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
        .filter(item => !(item.hidden || (item.type || '').includes('group')) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.dueTotal = due
        .filter(item => !(item.hidden || (item.type || '').includes('group')) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.assetsTotal = (u.accounts.assets || [])
        .filter(item => !JSON.parse(item.hidden) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.debts = (u.accounts.liabilities || [])
        .filter(item => !(item.hidden || (item.type || '').includes('group')) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.debtsTotal = (u.accounts.liabilities || [])
        .filter(item => !(item.hidden || (item.type || '').includes('group')) && item.total_owed)
        .reduce((all, one) => all + Number(one.total_owed), 0)
        .toFixed(2);

    return u;
}

function addSeperators(accounts) {
    var newAccounts = clone(accounts);

    const addSeps = section => {
        // clone defs and remove from section
        const defs = clone(
            section.filter(x => (x.type || '').includes('seperator-def')) || []
        );
        section = section.filter(x => !(x.type || '').includes('seperator-def'));

        // find range of dates for accounts
        section = section.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });
        //assumes date on all accounts
        const firstDate = section[0].date;
        const lastDate = '8/31/18';//section[section.length-1].date;

        // for defs, create seperators in range
        // eg. [accounts] / [seperator] / [accounts] / [seperator]
        var one_day=1000*60*60*24;
        const datePlusDays = (dateString, period) =>  new Date(
            new Date(dateString).getTime()
            + (period * one_day) + 10000000 //???? use a library instead?
        ).toLocaleDateString();
        const seperatorDates = defs.reduce((all, one) => {
            var sepDate = one.starts; //set time to earliest on that day?
            while(new Date(sepDate) < new Date(lastDate)){
                sepDate = datePlusDays(sepDate, one.period);
                if(new Date(sepDate) > new Date(firstDate)){
                    all.push(sepDate);
                }
            }
            return all;
        }, []);
        console.log('----', {defs, firstDate, lastDate, seperatorDates});
        // TODO: seems to be a drift (final date of 11/16 should be 11/17)

        // if first seperator is before all accounts, throw it away

        // only one seperator should exist after all accounts

        // sort accounts and seperators by date/name, seperators fall last in sort

        return section;
    };

    newAccounts = Object.keys(newAccounts).map(key => {
        var section = newAccounts[key];
        if(!['liabilities', 'assets'].includes(key)){
            return section;
        }
        return addSeps(section);
    });

    return newAccounts;
}

export {
    updateAccountsFromAccount,
    fixTotals,
    addSeperators
};
