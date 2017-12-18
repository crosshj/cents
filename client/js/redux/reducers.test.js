import reducer from './reducers';
const {popup:popupReducer, app:appReducer} = reducer;

import {
    init as actionsInit,
    receiveAccounts,
    accountSave,
    accountClick,
    popupUpdate
} from './actions';


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
        var expected = {"liabilities": [], "selectedMenuIndex": 0};
        expect(appReducer(state, action)).toEqual(expected)
    });

    it('should update group when child item changes', () => {
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
                status: 'paid'
            }]
        };
        var expected = JSON.parse(JSON.stringify(state));
        expected.liabilities.pop();
        expected.liabilities.pop();
        expected.liabilities[0].total_owed = 1400;
        expected.liabilities[0].amount = 500;
        expected.liabilities[0].status = 'due';
        expected.liabilities[0].date= '2017-10-09';

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
    });

});