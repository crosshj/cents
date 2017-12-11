
var dispatch = undefined;

function getAccounts(payload){
    dispatch({
        type: 'GET_ACCOUNTS',
        payload
    });
}

function menuSelect(payload){
    dispatch({
        type: 'MENU_SELECT',
        payload
    });
}

function accountClick(title){
    dispatch({
        type: 'POPUP_ACCOUNT',
        payload: { title }
    });
}

function groupClick(title){
    dispatch({
        type: 'GROUP_CLICK',
        payload: { title }
    });
}

function newAccountClick(){
    dispatch({
        type: 'POPUP_NEW_ACCOUNT'
    });
}

function newGroupClick(items){
    dispatch({
        type: 'POPUP_NEW_GROUP',
        paload: { items }
    });
}

function popupCancel(){
    dispatch({
        type: 'POPUP_CANCEL'
    });
}

function init(store){
    dispatch = store.dispatch;
}

export {
    init, getAccounts, menuSelect,
    accountClick, groupClick, newAccountClick, newGroupClick, popupCancel
}
