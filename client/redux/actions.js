
var dispatch = undefined;

function receiveAccounts(payload){
    return dispatch({
        type: 'RECEIVE_ACCOUNTS',
        payload
    });
}

function receiveAccountsSave(error, payload){
    return dispatch({
        type: 'RECEIVE_ACCOUNTS_SAVE',
        payload: Object.assign({}, payload, {error})
    });
}

function receiveAccountsData(error, payload){
    return dispatch({
        type: 'RECEIVE_ACCOUNTS_DATA',
        payload: Object.assign({}, payload, {error})
    });
}

function receiveHistory(payload){
    return dispatch({
        type: 'RECEIVE_HISTORY',
        payload
    });
}

function menuSelect(payload){
    return dispatch({
        type: 'MENU_SELECT',
        payload
    });
}

function accountClick(title){
    return dispatch({
        type: 'POPUP_ACCOUNT',
        payload: { title }
    });
}

function selectAccountClick(title){
    return dispatch({
        type: 'SELECT_ACCOUNT_CLICK',
        payload: { title }
    });
}

function groupClick(title){
    return dispatch({
        type: 'GROUP_CLICK',
        payload: { title }
    });
}

function newAccountClick(){
    return dispatch({
        type: 'POPUP_NEW_ACCOUNT'
    });
}

function newGroupClick(){
    return dispatch({
        type: 'POPUP_NEW_GROUP'
    });
}

function popupCancel(){
    return dispatch({
        type: 'POPUP_CANCEL'
    });
}

function popupHistory(field){
    return dispatch({
        type: 'POPUP_HISTORY',
        payload: field && { field }
    });
}

function popupHistoryBack(){
    return dispatch({
        type: 'POPUP_HISTORY_BACK'
    });
}

function groupRemove(){
    return dispatch({
        type: 'GROUP_REMOVE'
    });
}

function removeItem(payload){
    return dispatch({
        type: 'REMOVE_ITEM',
        payload
    });
}

function accountSave(){
    return dispatch({
        type: 'ACCOUNT_SAVE'
    });
}

function popupUpdate(updates){
    return dispatch({
        type: 'POPUP_UPDATE',
        payload: updates
    });
}

function init(store){
    dispatch = store.dispatch;
}

export {
    init, receiveAccounts, receiveAccountsSave, menuSelect, selectAccountClick, groupRemove, accountSave,
    accountClick, groupClick, newAccountClick, newGroupClick, popupCancel,
    popupHistory, popupHistoryBack, popupUpdate, receiveHistory, receiveAccountsData,
    removeItem
}
