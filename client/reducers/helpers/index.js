import { clone } from '../../js/react/utilities';

import { statToNumber } from '../../js/redux/utilities';

function updateAccountsFromAccount({ accounts, account }) {
    const _accounts = clone(accounts);

    const foundAccount = _accounts.liabilities.find(x => {
        // TODO: gettting based on title is kinda weak, tokenize in future
        const possibleAccountTitles = [
            (account.title || '').toLowerCase(),
            (account.oldTitle || '').toLowerCase()
        ].filter(x => x) || [];

        return account.title && (
            possibleAccountTitles.includes(
                (x.title || '').toLowerCase()
            )
        );
		});

		const isGroup = account => {
			return (account.type||'').includes('group') && !(account.type||'').includes('grouped');
		};

		// update any groups containing child where applicable
		if(account.oldTitle !== account.title && !isGroup(account)){
			const groupsContainingChild = _accounts.liabilities
				.filter(x => isGroup(x))
				.filter(x => x.items && x.items.map(i=>i.title || i).includes(account.oldTitle));
			groupsContainingChild.forEach(x => {
				x.items = x.items.filter(i =>
					!(i.title || i).includes(account.oldTitle)
				);
				x.items.push({ title: account.title });
			});
		}

    //console.log({ foundAccount });

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
    //console.log({ accounts, _accounts, account, _account });
    return _accounts;
}

function fixTotals(accounts, debug) {
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


	const ensureNumber = (thing) => typeof thing === 'number'
		? thing
		: Number(thing);
	const safeToTotal = (item, prop) => !(
		Boolean(item.hidden)
		|| (item.type || '').includes('seperator')
		|| ((item.type || '').includes('group') && !(item.type || '').includes('grouped'))
		|| ensureNumber(item[prop]) === 'NaN'
		|| isNaN(ensureNumber(item[prop]))
		|| !ensureNumber(item[prop])
	);

	// if(debug){
	// 	console.log({
	// 		pendingLength: pending.length,
	// 		pending: pending.filter(item => safeToTotal(item, 'amount'))
	// 	});
	// }

	u.totals.pendingTotal = pending
			.filter(item => safeToTotal(item, 'amount'))
			.reduce((all, one) => all + ensureNumber(one.amount), 0)
			.toFixed(2);

	u.totals.dueTotal = due
			.filter(item => safeToTotal(item, 'amount'))
			.reduce((all, one) => all + ensureNumber(one.amount), 0)
			.toFixed(2);

	u.totals.assetsTotal = (u.assets || [])
			.filter(item => safeToTotal(item, 'amount'))
			.reduce((all, one) => all + ensureNumber(one.amount), 0)
			.toFixed(2);

	u.totals.debts = (u.liabilities || [])
			.filter(item => safeToTotal(item, 'amount'))
			.reduce((all, one) => all + ensureNumber(one.amount), 0)
			.toFixed(2);

	u.totals.debtsTotal = (u.liabilities || [])
			.filter(item => safeToTotal(item, 'total_owed'))
			.reduce((all, one) => all + ensureNumber(one.total_owed), 0)
			.toFixed(2);

	return u;
}

const dateRangeFromAccounts = (accountList = []) => {
    if (!accountList.length) {
        return {};
    }
    // find range of dates for accounts
    const sortedAccounts = accountList.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
    });
    //assumes date on all accounts
    return {
        firstDate: sortedAccounts[0].date,
        lastDate: sortedAccounts[sortedAccounts.length - 1].date
    };
};

const datesfromDateRangeAndDefs = ({ firstDate, lastDate, defs }) => {
    // create seperators in range
    // eg. [accounts] / [seperator] / [accounts] / [seperator]
    var one_day = 1000 * 60 * 60 * 24;
    // without offset, seems to be a drift (final date of 11/16 vs 11/17)
    var arbitraryOffset = one_day / 12;
    const datePlusDays = (dateString, period) => new Date(
        new Date(dateString).getTime()
        + (period * one_day) + arbitraryOffset //???? use a library instead?
    ).toLocaleDateString();

    const dateMinusDays = (dateString, period) => new Date(
        new Date(dateString).getTime()
        - (period * one_day)
    ).toLocaleDateString();

    const seperatorDates = defs.reduce((all, one) => {
        var sepDate = one.starts;
        while (new Date(sepDate) < new Date(lastDate)) {
            const prevDate = clone(sepDate);
            sepDate = datePlusDays(sepDate, one.period);
            if (new Date(sepDate) > new Date(firstDate)) {
                const toPush = {
                    text: sepDate,
                    display: datePlusDays(prevDate, 1)
                };
                if(one.amount){
                    toPush.amount = one.amount;
                }
                all.push(toPush);
            }
        }
        return all;
    }, []);
    return seperatorDates;
};

const addTotalsToSeperators = ({ accountList, dateList }) => {
    const totaledSeperators = dateList.map((sepDate, si) => {
        var accsInRange = accountList.filter(acc =>
            // account date is less than or equal to seperator date
            new Date(acc.date) <= new Date(sepDate.text)
            // does not fall in range of previous seperator(s)
            && (
                si > 0
                    ? new Date(acc.date) > new Date(dateList[si - 1].text)
                    : true
            )
        );

        var u = {
            type: 'seperator group',
            date: sepDate.text,
            displayDate: sepDate.display
        };
        if(sepDate.amount){
            u.amount = sepDate.amount;
        }
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

function sortBetweenSeps(section){
    const isSeperator = a => (a.type||'').includes('seperator');
    const sortAccounts = list => list
        .sort((a, b) =>
            statToNumber[(a.status || '').toLowerCase()] > statToNumber[(b.status || '').toLowerCase()]
            || new Date(a.date) - new Date(b.date)
            || a.title < b.title
        );
    if(!section.find(isSeperator)){
        //console.log('---- no seperator');
        const sorted = [
            ...sortAccounts(section.filter(x=>x.status.toLowerCase() === 'due')),
            ...sortAccounts(section.filter(x=>x.status.toLowerCase() === 'pending')),
            ...sortAccounts(section.filter(x=>x.status.toLowerCase() === 'paid')),
        ];
        //console.log(sorted)
        return sorted;
    }

    var sortedSection = [];
    var buffer = [];
    section.forEach(a => {
        if(!(a.type||'').includes('seperator')){
            buffer.push(a);
            return;
        }

        const sortedBuffer = sortAccounts(clone(buffer));
        sortedSection = [...sortedSection, ...sortedBuffer, a];
        buffer = [];
    });

    return sortedSection;
}

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
        section = [...fullSeps, ...section].sort(function (a, b) {
            return new Date(a.date) - new Date(b.date)
                || statToNumber[(a.status || '').toLowerCase()] > statToNumber[(b.status || '').toLowerCase()]
                || a.title < b.title;
        });

        return section;
    };

    // add seperators to liabilities
    newAccounts = Object.keys(newAccounts).reduce((all, key) => {
        var section = newAccounts[key];
        if (!['liabilities'].includes(key)) {
            all[key] = section;
            return all;
        }
        //all[key] = addSeps(section);
        all[key] = sortBetweenSeps(addSeps(section));
        return all;
    }, {});

    return newAccounts;
}

export {
    updateAccountsFromAccount,
    fixTotals,
    addSeperators
};
