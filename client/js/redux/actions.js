
var dispatch = undefined;

function receiveAccounts(payload){
    dispatch({
        type: 'RECEIVE_ACCOUNTS',
        payload
    });
}

function receiveHistory(payload){
    dispatch({
        type: 'RECEIVE_HISTORY',
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

function popupHistory(field){
    dispatch({
        type: 'POPUP_HISTORY',
        payload: field && { field }
    });
}

function popupHistoryBack(){
    dispatch({
        type: 'POPUP_HISTORY_BACK'
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

function popupUpdate(updates){
    dispatch({
        type: 'POPUP_UPDATE',
        payload: updates
    });
}

function init(store){
    dispatch = store.dispatch;
}

export {
    init, receiveAccounts, menuSelect, selectAccountClick, groupRemove, accountSave,
    accountClick, groupClick, newAccountClick, newGroupClick, popupCancel,
    popupHistory, popupHistoryBack, popupUpdate, receiveHistory
}
