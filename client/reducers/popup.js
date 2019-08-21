import {
  fetchHistory
} from '../redux/services';

import {
  clone,
  bumpDateOneMonth,
  bumpDateOneMonthBack,
  statToNumber,
  numberToStat
} from '../redux/utilities.js';

function receiveHistory(state, action) {
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

function popupAccount(state, action, root) {
  var newState = clone(state);
  const accounts = root ? clone(root.accounts || []) : [];
  newState.account = root ? clone(root.account || {}) : {};

  if (newState.account.items) {
    if (root.selected && root.selected.length) {
      root.selected
        .forEach(x => {
          if (!newState.account.items
            .map(y => (y.title||'').toLowerCase())
            .includes((x.title||'').toLowerCase())
          ) {
            newState.account.items.push(clone(x));
          }
        })
    }
    newState.account.items = newState.account.items
      .map(x => {
        return accounts.liabilities.filter(y => {
          return typeof x === "string"
            ? (y.title||'').toLowerCase() === x.toLowerCase()
            : (y.title||'').toLowerCase() === (x.title||'').toLowerCase()
        })[0];
      })
      .filter(x => !!x)
      .sort((a, b) => b.total_owed - a.total_owed);

    newState.account.total_owed = newState.account.items.reduce((all, one) => {
      return Number(one.total_owed) + all;
    }, 0) || undefined;
  }
  newState.dateDirty = false;
  newState.error = newState.account ? false : 'could not find account';

  return newState;
}

function popupUpdate(state, action, { account, accounts }) {
  var newState = clone(state);

  if (!newState.account || typeof newState.account !== 'object') {
    newState.error = 'could not update popup state';
    return newState;
  }

  var oldAccount = clone(account);

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

function popupNewGroup(state, action, { selected = [], account = {} }) {
  var newState = undefined;

  var selectedAmount = selected.reduce((all, g) => { return all + Number(g.amount); }, 0);
  selectedAmount = parseFloat(selectedAmount).toFixed(2);

  var selectedOwed = selected.reduce((all, g) => { return all + Number(g.total_owed || 0); }, 0);
  selectedOwed = parseFloat(selectedOwed).toFixed(2);

  var selectedLatestDate = selected
    .map(x => x.date)
    .sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    })[0];

  var selectedStatus = selected
    .map(x => statToNumber[x.status])
    .reduce((all, one) => (one < all ? one : all), 0);

  newState = Object.assign({}, state, {
    error: false,
    dateDirty: false,
    account
  });

  newState.account = {
    type: "group",
    hidden: false,
    title: "New Group",
    note: "",
    items: clone(selected),
    isNew: true,
    status: numberToStat[selectedStatus],
    date: selectedLatestDate,
    amount: selectedAmount,
    total_owed: selectedOwed,
    auto: false
  };
  return newState;
}

function popupNewAccount(state, action) {
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

function popupCancel(state, action) {
  var newState = undefined;
  newState = Object.assign({}, state, {
    error: 'not initialized',
    account: undefined,
    history: undefined,
    dateDirty: false
  });
  return newState;
}

function popupHistory(state, action) {
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

function popupHistoryBack(state, action) {
  var newState = undefined;
  newState = Object.assign({}, state, {
    account: state.account,
    history: undefined,
    error: false
  });
  return newState;
}

function groupRemove(state, action) {
  var newState = undefined;
  newState = Object.assign({}, state, { error: 'not initialized', account: undefined });
  return newState;
}

function removeItem(state, action, root) {
  var newState = clone(state);
  const itemTitle = action.payload.title;

  newState.account.items = newState.account.items
    .filter(x => (x.title||'').toLowerCase() !== itemTitle.toLowerCase())
    .map(x => root.accounts.liabilities
      .filter(y => (x.title||'').toLowerCase() === (y.title||'').toLowerCase())[0]
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
  newState.account.items = newState.account.items.map(x => ({
    title: x.title,
    total_owed: x.total_owed,
    amount: x.amount
  }));
  return newState;
}

function accountSave(state, action, root) {
  var newState = undefined;
  newState = Object.assign({}, state, { error: 'not initialized' });
  newState.account = undefined;
  newState.dateDirty = false;
  return newState;
}

function popup(state, action, root) {
  //console.log(`--- popup runs: ${action.type}`);
  var newState = undefined;
  switch (action.type) {
    // case 'RECEIVE_ACCOUNTS':
    //   newState = receiveAccounts(state, action, root);
    //   break;
    case 'RECEIVE_HISTORY':
      newState = receiveHistory(state, action, root);
      break;
    case 'POPUP_ACCOUNT':
      newState = popupAccount(state, action, root);
      break;
    case 'POPUP_UPDATE':
      newState = popupUpdate(state, action, root);
      break;
    case 'POPUP_NEW_GROUP':
      newState = popupNewGroup(state, action, root);
      break;
    case 'POPUP_NEW_ACCOUNT':
      newState = popupNewAccount(state, action, root);
      break;
    case 'POPUP_CANCEL':
      newState = popupCancel(state, action, root);
      break;
    case 'POPUP_HISTORY':
      newState = popupHistory(state, action, root);
      break;
    case 'POPUP_HISTORY_BACK':
      newState = popupHistoryBack(state, action, root);
      break;
    case 'GROUP_REMOVE':
      newState = groupRemove(state, action, root);
      break;
    case 'REMOVE_ITEM':
      newState = removeItem(state, action, root);
      break;
    case 'ACCOUNT_SAVE':
      newState = accountSave(state, action, root);
      break;
  }
  return newState || state || {};
}

export default popup;
export {
  receiveHistory, popupAccount, popupUpdate, popupNewGroup,
  popupNewAccount, popupCancel, popupHistory, popupHistoryBack, groupRemove,
  removeItem, accountSave
};
