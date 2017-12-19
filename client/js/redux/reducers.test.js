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
                dueTotal: "0.00", pendingTotal: "0.00"
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
        expected.totals = {
            assetsTotal: "0.00", debts: "500.00", debtsTotal: "1400.00",
            dueTotal: "300.00", pendingTotal: "200.00"
        };

        // has side effect of loading accounts into reducer state
        appReducer(state, receiveAccounts(state));
        // has side effect of loading account into reducer state
        popupReducer(
            Object.assign({}, {account: state.liabilities[1]}, state),
            popupUpdate({ amount: 300, total_owed: 1000, status: 'due', date: '2020-10-10' })
        );
        // simulate child save
        var result = appReducer(state, accountSave('child'));
        expect(result).toEqual(expected)

        // cleanup
        popupReducer(state, accountSave('child'));
    });

    it('should update date when status changes', () => {
        var state = {
            account: {
                date: '2017-10-08',
                status: 'paid'
            }
        };

        // init as paid
        // appReducer({}, receiveAccounts(state));
        // state = popupReducer({}, accountClick('foo'));

        // move status to due
        var expected = clone(state);
        expected.account.status = 'due';
        state = popupReducer(state, popupUpdate({ status: 'due' }));
        expect(state).toEqual(expected);

        // move status to paid
        expected = clone(state);
        expected.account.status = 'paid';
        expected.account.date = '2017-11-08';
        state = popupReducer(state, popupUpdate({ status: 'paid' }));
        expect(state).toEqual(expected);

        // move status to due
        expected = clone(state);
        expected.account.status = 'pending';
        expected.account.date = '2017-10-08';
        state = popupReducer(state, popupUpdate({ status: 'pending' }));
        expect(state).toEqual(expected);

    });

});