function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}

function groupWithChildren(){
    var example =  {
        liabilities: [{
            title: 'group',
            items: [
                {
                    title: 'child',
                    date: '2017-10-08',
                    amount: 200,
                    total_owed: 400,
                    type: 'grouped',
                    status: 'paid',
                    selected: false
                }, {
                    title: 'child2',
                    date: '2017-10-09',
                    amount: 200,
                    total_owed: 400,
                    type: 'grouped',
                    status: 'pending',
                    selected: false
                }
            ],
            date: '2017-10-08',
            amount: 400,
            total_owed: 800,
            type: 'group',
            status: 'pending',
            selected: false
        },{
            title: 'child',
            date: '2017-10-08',
            amount: 200,
            total_owed: 400,
            type: 'grouped',
            status: 'paid',
            selected: false
        },{
            title: 'child2',
            date: '2017-10-09',
            amount: 200,
            total_owed: 400,
            type: 'grouped',
            status: 'pending',
            selected: false
        }],
        totals: {
            assetsTotal: '0.00',
            balance: 0,
            debts: '400.00',
            debtsTotal: '800.00',
            dueTotal: '0.00',
            pendingTotal: '200.00'
        },
        selectedMenuIndex: 0
    };
    var _example = clone(example);
    _example.accounts ={ liabilities: example.liabilities };
    return _example;
}

function lotsOfAccounts(amount){
	const lots = groupWithChildren();
	lots.accounts.liabilities = lots.accounts.liabilities.concat((new Array(amount).fill()).map((x, i) => {
		const randomAccount = clone(lots.accounts.liabilities.find(x=>x.title==='child'));
		randomAccount.title = Math.random().toString(36).substring(2, 15) + ' ' + Math.random().toString(36).substring(2, 15);

		const month = i%12 || 1;
		// padding, meh
		randomAccount.date = `2017-${month}-${i+1}`;
		return randomAccount;
	}));
	return lots;
}

const accountsData = () => ({
    data: {
        accounts: [{
            balance: '999.09'
        }]
    }
});

export {
		groupWithChildren,
		lotsOfAccounts,
    accountsData
};