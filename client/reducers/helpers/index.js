import { clone } from '../../js/react/utilities';

function updateAccountsFromAccount({ accounts, account }) {
    const _accounts = clone(accounts);

    const foundAccount = _accounts.liabilities.find(x => {
        // TODO: gettting based on title is kinda weak, tokenize in future
        return account.title && [
            (account.title||'').toLowerCase(),
            (account.oldTitle || '').toLowerCase()
        ].includes(
            (x.title||'').toLowerCase()
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
    // var paid = (u.accounts.liabilities || [])
    //     .filter(function (a) {
    //         return a.status && a.status.toLowerCase() === 'paid';
    //     }).sort(function (a, b) {
    //         return new Date(a.date) - new Date(b.date);
    //     });
    var due = (u.accounts.liabilities || [])
        .filter(function (a) {
            return a.status && a.status.toLowerCase() === 'due';
        }).sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });

    const visibleNotGroup = item =>
        !(item.hidden || (item.type || '').includes('seperator'));

    u.totals.pendingTotal = pending
        .filter(item => visibleNotGroup(item) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.dueTotal = due
        .filter(item => visibleNotGroup(item) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.assetsTotal = (u.accounts.assets || [])
        .filter(item => !JSON.parse(item.hidden) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.debts = (u.accounts.liabilities || [])
        .filter(item => visibleNotGroup(item) && item.amount)
        .reduce((all, one) => all + Number(one.amount), 0)
        .toFixed(2);

    u.totals.debtsTotal = (u.accounts.liabilities || [])
        .filter(item => visibleNotGroup(item) && item.total_owed)
        .reduce((all, one) => all + Number(one.total_owed), 0)
        .toFixed(2);

    return u;
}

const dateRangeFromAccounts = (accountList = []) => {
    if(!accountList.length){
        return {};
    }
    // find range of dates for accounts
    const sortedAccounts = accountList.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
    });
    //assumes date on all accounts
    return {
        firstDate: sortedAccounts[0].date,
        lastDate: sortedAccounts[sortedAccounts.length-1].date
    };
};

const datesfromDateRangeAndDefs = ({ firstDate, lastDate, defs }) => {
    // create seperators in range
    // eg. [accounts] / [seperator] / [accounts] / [seperator]
    var one_day=1000*60*60*24;
    // without offset, seems to be a drift (final date of 11/16 vs 11/17)
    var arbitraryOffset = one_day/24;
    const datePlusDays = (dateString, period) =>  new Date(
        new Date(dateString).getTime()
        + (period * one_day) + arbitraryOffset //???? use a library instead?
    ).toLocaleDateString();
    const seperatorDates = defs.reduce((all, one) => {
        var sepDate = one.starts;
        while(new Date(sepDate) < new Date(lastDate)){
            sepDate = datePlusDays(sepDate, one.period);
            if(new Date(sepDate) > new Date(firstDate)){
                all.push(sepDate);
            }
        }
        return all;
    }, []);
    return seperatorDates;
};

const addTotalsToSeperators = ({ accountList, dateList}) => {
    const totaledSeperators = dateList.map((sepDate, si) => {
        var accsInRange = accountList.filter(acc =>
            // account date is less than or equal to seperator date
            new Date(acc.date) <= new Date(sepDate)
            // does not fall in range of previous seperator(s)
            && (
                si > 0
                    ? new Date(acc.date) > new Date(dateList[si-1])
                    : true
            )
        );

        var u = {
            type: 'seperator group',
            date: sepDate
        };
        const visibleNotSeperator = item =>
            !(item.hidden || (item.type || '').includes('seperator'));

        u.due = accsInRange
            .filter(item => visibleNotSeperator(item) && item.amount)
            .filter(x => x.status.toLowerCase() === 'due')
            .reduce((all, one) => all + Number(one.amount), 0)
            .toFixed(2);

        u.pending = accsInRange
            .filter(item => visibleNotSeperator(item) && item.amount)
            .filter(x => x.status.toLowerCase() === 'pending')
            .reduce((all, one) => all + Number(one.amount), 0)
            .toFixed(2);

        u.paid = accsInRange
            .filter(item => visibleNotSeperator(item) && item.amount)
            .filter(x => x.status.toLowerCase() === 'paid')
            .reduce((all, one) => all + Number(one.amount), 0)
            .toFixed(2);

        u.total = accsInRange
            .filter(item => visibleNotSeperator(item) && item.amount)
            .reduce((all, one) => all + Number(one.amount), 0)
            .toFixed(2);

        u.total_owed = accsInRange
            .filter(item => visibleNotSeperator(item) && item.total_owed)
            .reduce((all, one) => all + Number(one.total_owed), 0)
            .toFixed(2);

        return u;
    });

    return totaledSeperators;
};

function addSeperators(accounts) {
    var newAccounts = clone(accounts);

    const addSeps = section => {
        // clone defs and remove from section
        const defs = clone(
            section.filter(x => (x.type || '').includes('seperator-def')) || []
        );
        section = section.filter(x => !(x.type || '').includes('seperator-def'));

        // create seperators
        const { firstDate, lastDate } = dateRangeFromAccounts(section);
        const seperatorDates = datesfromDateRangeAndDefs({
            firstDate, lastDate, defs
        });

        // add totals to seperators based on accounts
        const fullSeps = addTotalsToSeperators({
            accountList: section,
            dateList: seperatorDates
        });

        // sort accounts and seperators by date/name, seperators fall last in sort
        // TODO: maybe need to handle sorting better since seps don't have title
        section = [...fullSeps, ...section].sort(function (a, b) {
            return new Date(a.date) - new Date(b.date) || a.title < b.title;
        });

        return section;
    };

    // add seperators to liabilities
    newAccounts = Object.keys(newAccounts).reduce((all, key) => {
        var section = newAccounts[key];
        if(!['liabilities'].includes(key)){
            all[key] = section;
            return all;
        }
        all[key] = addSeps(section);
        return all;
    }, {});

    return newAccounts;
}

export {
    updateAccountsFromAccount,
    fixTotals,
    addSeperators
};
