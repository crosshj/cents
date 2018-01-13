import {
  fetchHistory
} from '../js/redux/services';

import {
  clone,
  updateGroupFromChildren,
  safeAccess,
  fixTotals,
  openGroupedAccounts,
  bumpDateOneMonth,
  bumpDateOneMonthBack,
  statToNumber
} from '../js/redux/utilities.js';
import { newGroupClick } from '../js/redux/actions';

function receiveAccounts (state, action){
  var newState = clone(state);
  if (action.payload.error) {
    newState = Object.assign({}, state, action.payload);
    return newState;
  }
  newState.accounts = clone(action.payload) || {};
  return newState;
}

function receiveHistory(state, action){
  var newState = undefined;
  clone(state);
  if (action.payload.error) {
    newState.history = { error: action.payload.error };
    return newState;
  }
  newState = clone(state);
  newState.history.error = false;
  newState.history.data = action.payload;
  return newState;
}

function popupAccount(state, action){
  var newState = clone(state);
  const liabilities = (state.liabilities || (state.accounts||{}).liabilities || []);
  const assets = (state.assets || (state.accounts||{}).assets || []);

  newState.account = [].concat(liabilities, assets)
    .filter(a => a.title.toLowerCase() === action.payload.title.toLowerCase());
  newState.account = clone(newState.account[0] || {});

  //console.log(liabilities);

  if (newState.account.items) {
    if (newState.selected && newState.selected.length) {
      newState.selected
        .forEach(x => {
          if (!newState.account.items
            .map(y => y.title.toLowerCase())
            .includes(x.title.toLowerCase())
          ) {
            newState.account.items.push(clone(x));
          }
        })
    }
    newState.account.items = newState.account.items
      .map(x => {
        return state.accounts.liabilities.filter(y => y.title.toLowerCase() === x.title.toLowerCase())[0]
      })
      .sort((a, b) => b.total_owed - a.total_owed);
  }
  newState.dateDirty = false;
  newState.error = newState.account ? false : 'could not find account';

  return newState;
}

function popupUpdate(state, action){
  var newState = undefined;
  newState = clone(state);
  ///console.log('!!!', newState);
  if(typeof newState.account !== 'object'){
    newState.error = 'could not update popup state';
    return newState;
  }

  const liabilities = (state.accounts||{}).liabilities || [];
  const assets = (state.accounts||{}).assets || [];

  var oldAccount = [].concat(liabilities, assets)
    .filter(a => a.title.toLowerCase() === newState.account.title.toLowerCase());
  oldAccount = clone(oldAccount[0] || {});

  Object.keys(action.payload)
    .forEach(fieldName => {
      if (fieldName === 'title') {
        newState.account.oldTitle = newState.account.title;
      }
      newState.account[fieldName] = action.payload[fieldName]
    });
  // change date based on status change
  if (action.payload.status) {
    const isNewPaid = action.payload.status.toLowerCase() === 'paid';
    const isPrevPaid = state.account.status.toLowerCase() === 'paid';
    const isOldAccountPaid = oldAccount && oldAccount.status === 'paid';
    const shouldAutoReduce = !!state.account.autoReduce;

    if (isPrevPaid && state.dateDirty) {
      newState.account.date = bumpDateOneMonthBack(newState.account.date);
      newState.dateDirty = false;
      if (shouldAutoReduce) {
        newState.account.total_owed += Number(newState.account.amount);
      }
    }

    if (!isPrevPaid && isNewPaid && !isOldAccountPaid) {
      newState.account.date = bumpDateOneMonth(newState.account.date);
      newState.dateDirty = true;
      if (shouldAutoReduce) {
        newState.account.total_owed -= Number(newState.account.amount);
      }
    }
  }
  return newState;
}

function popupNewGroup (state, action){
  var newState = undefined;

  var selectedAmount = state.selected.reduce((all, g) => { return all + Number(g.amount); }, 0);
  selectedAmount = parseFloat(selectedAmount).toFixed(2);
  var selectedOwed = state.selected.reduce((all, g) => { return all + Number(g.total_owed || 0); }, 0);
  selectedOwed = parseFloat(selectedOwed).toFixed(2);
  var selectedLatestDate = state.selected
    .map(x => x.date)
    .sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    })[0];
  newState = Object.assign({}, state, {
    error: false,
    dateDirty: false,
    account: JSON.parse(JSON.stringify(state.account || false))
  });
  newState.account = {
    type: "group",
    hidden: false,
    title: "New Group",
    note: "",
    items: state.selected,
    isNew: true,
    status: "paid", // TODO: update from selected accounts
    date: selectedLatestDate,
    amount: selectedAmount,
    total_owed: selectedOwed,
    auto: false
  };
  return newState;
}

function popupNewAccount(state, action){
  var newState = undefined;
  var account = {
    type: "",
    hidden: false,
    title: "New Group",
    note: "",
    isNew: true,
    status: "paid",
    date: "2017-10-18", //TODO: a month from now?
    amount: 0,
    total_owed: 0,
    auto: false
  };
  newState = Object.assign({}, state, {
    error: false,
    account
  });
  newState.dateDirty = false;
  return newState;
}

function popupCancel(state, action){
  var newState = undefined;
  newState = Object.assign({}, state, {
    error: 'not initialized',
    account: undefined,
    history: undefined,
    dateDirty: false
  });
  return newState;
}

function popupHistory(state, action){
  var newState = undefined;
  const { field } = action.payload;
  const title = (state.account || {}).title || 'Total Owed';
  const history = { error: 'loading', field, title };
  newState = Object.assign({}, state, {
    account: state.account,
    history,
    error: false
  });
  const type = state.account ? 'liabilities' : 'balance'; //TODO: get type in a better way
  fetchHistory({ type, title, field });
  return newState;
}

function popupHistoryBack(state, action){
  var newState = undefined;
  newState = Object.assign({}, state, {
    account: state.account,
    history: undefined,
    error: false
  });
  return newState;
}

function groupRemove(state, action){
  var newState = undefined;
  newState = Object.assign({}, state, { error: 'not initialized', account: undefined });
  return newState;
}

function removeItem(state, action){
  var newState = clone(state);
  const itemTitle = action.payload.title;

  newState.account.items = newState.account.items
    .filter(x => x.title.toLowerCase() !== itemTitle.toLowerCase())
    .map(x => newState.accounts.liabilities
      .filter(y => x.title.toLowerCase() === y.title.toLowerCase())[0]
    );

  // update amount / total_owed / date / status for group
  newState.account.amount = newState.account.items
    .map(x => x.amount)
    .reduce((total, z) => Number(total) + Number(z), 0)
    .toFixed(2);
  newState.account.total_owed = newState.account.items
    .map(x => x.total_owed)
    .reduce((total, z) => Number(total) + Number(z), 0)
    .toFixed(2);
  newState.account.date = newState.account.items
    .map(x => x.date)
    .sort(function (a, b) {
      return new Date(a) - new Date(b);
    })[0];
  newState.account.status = newState.account.items
    .map(x => x.status)
    .reduce((status, z) => statToNumber[status.toLowerCase()] < statToNumber[z.toLowerCase()]
      ? status.toLowerCase()
      : z.toLowerCase()
    , 'paid');
  newState.account.items = newState.account.items.map(x => ({ title: x.title }));
  return newState;
}

function accountSave(state, action){
  var newState = undefined;
  newState = Object.assign({}, state, { error: 'not initialized' });
  newState.account = undefined;
  newState.dateDirty = false;
  return newState;
}

function selectAccountClick(state, action){
  var newState = clone(state);
  newState.accounts.liabilities.forEach(liab => {
      if (liab.title === action.payload.title) {
          liab.selected = !liab.selected;
      }
  });
  newState.selected = newState.accounts.liabilities.filter(x => x.selected);
  return newState;
}

function popup(state, action) {
  var newState = undefined;

  switch (action.type) {
    case 'RECEIVE_ACCOUNTS':
      newState = receiveAccounts(state, action);
      break;
    case 'RECEIVE_HISTORY':
      newState = receiveHistory(state, action);
      break;
    case 'POPUP_ACCOUNT':
      newState = popupAccount(state, action);
      break;
    case 'POPUP_UPDATE':
      newState = popupUpdate(state, action);
      break;
    case 'POPUP_NEW_GROUP':
      newState = popupNewGroup(state, action);
      break;
    case 'POPUP_NEW_ACCOUNT':
      newState = popupNewAccount(state, action);
      break;
    case 'POPUP_CANCEL':
      newState = popupCancel(state, action);
      break;
    case 'POPUP_HISTORY':
      newState = popupHistory(state, action);
      break;
    case 'POPUP_HISTORY_BACK':
      newState = popupHistoryBack(state, action);
      break;
    case 'GROUP_REMOVE':
      newState = groupRemove(state, action);
      break;
    case 'REMOVE_ITEM':
      newState = removeItem(state, action);
      break;
    case 'ACCOUNT_SAVE':
      newState = accountSave(state, action);
      break;
    case 'SELECT_ACCOUNT_CLICK':
      newState = selectAccountClick(state, action);
      break;
  }
  return newState || state || {};
}

export default popup;
export {
  receiveAccounts, receiveHistory, popupAccount, popupUpdate, popupNewGroup,
  popupNewAccount, popupCancel, popupHistory, popupHistoryBack, groupRemove,
  removeItem, accountSave
};
