/* global
    describe:false,
    beforeAll:false,
    it:false,
    expect:false
*/
import reducer from './reducers';
const {popup:popupReducer, app:appReducer} = reducer;

import {
    init as actionsInit,
    accountClick,
    groupClick,
    receiveAccounts,
    accountSave,
    popupUpdate
} from './actions';

const clone = x => JSON.parse(JSON.stringify(x));


describe('app reducer', () => {
    beforeAll(()=>{
        global.fetch = () => new Promise(() => {});
        actionsInit({
            dispatch: x => x
        });
    });

    it('should return the initial state', () => {
        var state = undefined;
        var action = {};
        var expected = {};
        expect(appReducer(state, action)).toEqual(expected)
    });

    it('should handle basic receive accounts', () => {
        var state = undefined;
        var action = receiveAccounts({
            liabilities: []
        });
        var expected = {
            liabilities: [],
            totals: {
                assetsTotal: "0.00", debts: "0.00", debtsTotal: "0.00",
                dueTotal: "0.00", pendingTotal: "0.00",
                balance: 0,
                updating: true
            },
            selectedMenuIndex: 0
        };
        expect(appReducer(state, action)).toEqual(expected)
    });

    it('should update group and totals when child item changes', () => {
        var state = {
            liabilities: [{
                title: 'group',
                items: [{ title: 'child'}, { title: 'child2'}],
                date: '2017-10-08',
                amount: 200,
                total_owed: 400,
                type: 'group',
                status: 'paid'
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
            }]
        };
        var expected = JSON.parse(JSON.stringify(state));
        expected.liabilities.pop();
        expected.liabilities.pop();
        expected.liabilities[0].total_owed = 1400;
        expected.liabilities[0].amount = 500;
        expected.liabilities[0].status = 'due';
        expected.liabilities[0].date= '2017-10-09';
        expected.liabilities[0].open = false;
        expected.totals = {
            assetsTotal: "0.00", debts: "500.00", debtsTotal: "1400.00",
            dueTotal: "300.00", pendingTotal: "200.00"
        };
        expected.selectedMenuIndex = 0;

        // receive all accounts
        var newState = appReducer(state, receiveAccounts(state));

        // open group
        newState = appReducer(newState, groupClick('group'));

        // load child account
        newState = appReducer(newState, accountClick('child'));

        // make changes
        newState = appReducer(
            newState,
            popupUpdate({ amount: 300, total_owed: 1000, status: 'due', date: '2020-10-10' })
        );

        // save child
        newState = appReducer(newState, accountSave('child'));
        
        // close group
        newState = appReducer(newState, groupClick('group'));

        expect(newState).toEqual(expected)
    });

    it('should update date when status changes', () => {
        var state = {
            accounts: {
                liabilities: [{
                    title: 'foo',
                    status: 'due'
                }]
            },
            account: {
                title: 'foo',
                date: '2017-10-08',
                status: 'due'
            }
        };

        // move status to paid
        var expected = clone(state);
        expected.account.status = 'paid';
        expected.account.date = '2017-11-08';
        expected.dateDirty = true;
        state = popupReducer(state, popupUpdate({ status: 'paid' }));
        expect(state).toEqual(expected);

        // move status to due
        expected = clone(state);
        expected.account.status = 'pending';
        expected.account.date = '2017-10-08';
        expected.dateDirty = false;
        state = popupReducer(state, popupUpdate({ status: 'pending' }));
        expect(state).toEqual(expected);

    });

    it('should save group properly when updating group title', () => {
        var state = {
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
                debts: '400.00',
                debtsTotal: '800.00',
                dueTotal: '0.00',
                pendingTotal: '200.00'
            },
            selectedMenuIndex: 0
        };

        // has side effect of loading accounts into reducer state
        var result = appReducer(state, receiveAccounts(state));
        result = appReducer(result, receiveAccounts(state));
        // has side effect of loading account into reducer state
        result = appReducer(
            result,
            accountClick('group')
        );
        result = appReducer(
            result,
            popupUpdate({ title: 'new group title'})
        );

        // simulate group save
        result = appReducer(result, accountSave('new group title'));
        //result = popupReducer(result, accountSave('new group title'));

        var expected = clone(state);
        expected.liabilities[0].title = 'new group title';
        expected.liabilities = [expected.liabilities[0]];

        expect(result).toEqual(expected);

        // var again = popupReducer(
        //     result,
        //     accountClick('new group title')
        // );

        // console.log(result.liabilities[0].items);
    });

});