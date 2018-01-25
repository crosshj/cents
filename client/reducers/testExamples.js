function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}

function groupWithChildren(){
    var example =  {
        liabilities: [{
            title: 'group',
            items: [{ title: 'child'}, { title: 'child2'}],
            date: '2017-10-08',
            amount: 400,
            total_owed: 800,
            type: 'group',
            status: 'pending'
        },{
            title: 'child',
            date: '2017-10-08',
            amount: 200,
            total_owed: 400,
            type: 'grouped',
            status: 'paid'
        },{
            title: 'child2',
            date: '2017-10-09',
            amount: 200,
            total_owed: 400,
            type: 'grouped',
            status: 'pending'
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

export {
    groupWithChildren
};