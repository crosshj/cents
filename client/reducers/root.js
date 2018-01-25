/*

here will be a root reducer which keeps track of accounts and account
these are shared between app and popup

*/

var _account = undefined;
var _accounts = undefined;

const root = () => ({
    accounts: _accounts,
    account: _account,
    set: ({account, accounts}) => {
        if (account) _account = account;
        if (accounts) _accounts = accounts;
    }
});


function bind(reducer){
    return (state, action) => reducer(state, action, root());
}

export default {
    bind
};
