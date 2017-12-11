
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

function selectAccountClick(title){
    dispatch({
        type: 'SELECT_ACCOUNT_CLICK',
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

function newGroupClick(){
    dispatch({
        type: 'POPUP_NEW_GROUP'
    });
}

function popupCancel(){
    dispatch({
        type: 'POPUP_CANCEL'
    });
}

function groupRemove(){
    dispatch({
        type: 'GROUP_REMOVE'
    });
}

function accountSave(){
    dispatch({
        type: 'ACCOUNT_SAVE'
    });
}

function init(store){
    dispatch = store.dispatch;
}

export {
    init, getAccounts, menuSelect, selectAccountClick, groupRemove, accountSave,
    accountClick, groupClick, newAccountClick, newGroupClick, popupCancel
}
