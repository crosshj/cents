import {
  saveAccounts
} from '../js/redux/services';

import {
  updateGroupFromChildren,
  markGroupedItems
} from '../js/redux/utilities';

import {
  clone,
  safeAccess
} from '../js/react/utilities';

import {
  fixTotals, addSeperators
} from './helpers';

// Reducer
const statToNumber = {
  due: 1,
  pending: 2,
  paid: 3
};

function sortAccounts(liabilities) {
  var pending = (liabilities || [])
    .filter(function (a) {
      return a.status && a.status.toLowerCase() === 'pending';
    }).sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  var paid = (liabilities || [])
    .filter(function (a) {
      return a.status && a.status.toLowerCase() === 'paid';
    }).sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  var due = (liabilities || [])
    .filter(function (a) {
      return a.status && a.status.toLowerCase() === 'due';
    }).sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });
  return [
    ...due,
    ...pending,
    ...paid
  ];
}

function openGroupedAccounts(initialState, viewState) {
  const outputState = clone(viewState);

  // stupid "false"
  if (!outputState.accounts) {
    console.log(JSON.stringify({ outputState, initialState, viewState }, null, '  '));
    console.trace();
  }
  outputState.accounts.liabilities.forEach(
    x => x.hidden === "false" ? x.hidden = false : undefined
  );

  // remove grouped items
  outputState.accounts.liabilities = outputState.accounts.liabilities
    .filter(x => x.type !== 'grouped');

  // remove hidden items
  outputState.accounts.liabilities = outputState.accounts.liabilities
    .filter(x => !x.hidden);

  // add grouped items back if group open
  //console.log(initialState)
  var newLiabs = [];
  outputState.accounts.liabilities.forEach(group => {
    newLiabs.push(group);
    if (!group.open || group.type !== 'group') return;

    const groupedItems = group.items
      .map(item => (initialState.accounts.liabilities.filter(x => {
        return typeof i === 'string'
          ? x.title === item
          : x.title === item.title;
      }) || [])[0])
      .sort(function (a, b) {
        var statCompare = 0;
        if (statToNumber[a.status.toLowerCase()] > statToNumber[b.status.toLowerCase()]) statCompare = 1;
        if (statToNumber[a.status.toLowerCase()] < statToNumber[b.status.toLowerCase()]) statCompare = -1;

        return statCompare || new Date(a.date) - new Date(b.date);
      });
    groupedItems.forEach(x => x.type = 'grouped');

    newLiabs = newLiabs.concat(groupedItems);
  });

  outputState.accounts.liabilities = newLiabs;
  return outputState;
}

/*

   _  _  _       _  _  _  _    _  _  _  _
  (_)(_)(_) _   (_)(_)(_)(_)_ (_)(_)(_)(_)_
   _  _  _ (_)  (_)        (_)(_)        (_)
 _(_)(_)(_)(_)  (_)        (_)(_)        (_)
(_)_  _  _ (_)_ (_) _  _  _(_)(_) _  _  _(_)
  (_)(_)(_)  (_)(_)(_)(_)(_)  (_)(_)(_)(_)
                (_)           (_)
                (_)           (_)

*/

function receiveAccounts(state, action, root) {
  var newState = {};
  if (action.payload.error) {
    newState = Object.assign({}, state, action.payload);
    return newState;
  }
  newState.accounts = clone(action.payload) || {};
  (newState.accounts.liabilities || []).forEach(x => {
    if (x.hidden === 'false') {
      x.hidden = false;
    }
  });
  newState = updateGroupFromChildren(newState, root);
  newState.totals = safeAccess(() => state.totals) || {};
  newState.totals.balance = safeAccess(() => state.totals.balance) || 0;
  newState.totals.updating = true;
  newState = fixTotals(newState);
  newState = openGroupedAccounts(newState, newState);
  newState.accounts = addSeperators(newState.accounts);
  //console.log(JSON.stringify({newState}, null, '  '))

  if (state && typeof state.selectedMenuIndex === "undefined") {
    newState.selectedMenuIndex = window && window.localStorage
      ? Number(localStorage.getItem('selectedTab'))
      : 0;
  } else {
    newState.selectedMenuIndex = state ? state.selectedMenuIndex : 0;
  }
  //newState.accounts = action.payload;
  //debugger
  return newState;
}

function receiveAccountsData(state, action, root) {
  var newState;
  if (action.payload.error) {
    newState = Object.assign({}, state, action.payload);
    return newState;
  }
  newState = clone(state);
  const balance = safeAccess(() => action.payload.data.accounts[0].balance);
  newState.accounts.totals = newState.accounts.totals || {};
  newState.accounts.totals.balance = Number(balance || 0);
  newState.accounts.totals.updating = false;

  newState.accounts = addSeperators(newState.accounts);

  return newState;
}

function receiveAccountsSave(state, action, root) {
  var newState;
  if (action.payload.error) {
    newState = Object.assign({}, state, action.payload);
    return newState;
  }
  // console.log('got accounts save, notify if an error');
  newState = clone(state);
  newState.error = false;
  return newState;
}

function menuSelect(state, action, root) {
  var newState;
  localStorage.setItem('selectedTab', action.payload);
  const selectedMenuIndex = action.payload;
  newState = clone(state);
  newState.selectedMenuIndex = selectedMenuIndex;
  //newState.accounts.liabilities.forEach(x => x.selected = false);
  return newState;
}

function selectAccountClick(state, action, { selected = [] }) {
  const newState = clone(state);
  newState.accounts.liabilities.forEach(l => {
    l.selected = selected.map(x => x.title).includes(l.title);
  });
  //newState.selected = selected.map(x => x.title);
  return newState;
}

function groupClick(state, action, root) {
  //console.log({state, action, root});
  var newState;
  const groupTitle = action.payload.title;
  //const group = (state.liabilities.filter(x => x.title === groupTitle) || [])[0];

  newState = clone(state);
  // toggle group open
  newState.accounts.liabilities = newState.accounts.liabilities
    .filter(x => x)
    .map(x => {
      if ((x.title || '').toLowerCase() === groupTitle.toLowerCase()) {
        x.open = typeof x.open !== 'undefined'
          ? !x.open
          : true;
      }
      return x;
    });
  //console.log(root)
  newState = openGroupedAccounts(root, newState);

  // toggle open/closed
  //newState = switchGroup(group, state, accounts, !group.open)
  return newState;
}

function groupRemove(state, action, root) {
  var newState = clone(state);

  newState.accounts = clone(root.accounts);

  //TODO: should do this in root reducer
  saveAccounts({
    assets: newState.accounts.assets,
    liabilities: newState.accounts.liabilities,
    balance: newState.accounts.balance
  });
  newState.accounts.assets = root
    ? clone(safeAccess(() => root.accounts.assets) || [])
    : [];
  newState.accounts.liabilities = root
    ? clone(safeAccess(() => root.accounts.liabilities) || [])
    : [];
  newState.account = undefined;

  newState = markGroupedItems(newState.accounts);
  newState = openGroupedAccounts(root, newState);

  return newState;
}

function accountSave(state, action, root) {
  if (!action.payload.account) {
    return state;
  }

  var newState = clone(state);

  // rehydrate grouped items, maybe not needed
  newState.accounts = clone(root.accounts);
  (newState.accounts.liabilities || []).forEach(liab => {
    if (liab.type !== 'group') return;
    liab.items = (liab.items || [])
      .map(i => newState.accounts.liabilities
        .find(l => {
          return typeof i === 'string'
            ? l.title === i
            : l.title === i.title;
        })
      ) || [];
  });

  newState = updateGroupFromChildren(newState, root);
  (newState.accounts.liabilities || []).forEach(x => {
    if (x.type !== 'grouped') return;
    delete x.type;
  });
  newState.accounts = markGroupedItems(newState.accounts);


  newState.accounts.totals = clone(root.accounts.totals);
  // don't need it and should fix or use this exclusively
  newState.totals = clone(root.accounts.totals);

  newState = openGroupedAccounts(root, newState);

  //sort accounts
  newState.accounts.liabilities = sortAccounts(newState.accounts.liabilities);

	newState.accounts = addSeperators(newState.accounts);

  return newState;
}

function app(state, action, root) {
  //console.log(`--- app runs: ${action.type}`);
  var newState = undefined;
  //var groupedItems = undefined;
  switch (action.type) {
    case 'RECEIVE_ACCOUNTS':
      newState = receiveAccounts(state, action, root);
      break;
    case 'RECEIVE_ACCOUNTS_DATA':
      newState = receiveAccountsData(state, action, root);
      break;
    case 'RECEIVE_ACCOUNTS_SAVE':
      newState = receiveAccountsSave(state, action, root);
      break;
    case 'MENU_SELECT':
      newState = menuSelect(state, action, root);
      break;
    case 'SELECT_ACCOUNT_CLICK':
      newState = selectAccountClick(state, action, root);
      break;
    case 'GROUP_CLICK':
      newState = groupClick(state, action, root);
      break;
    case 'GROUP_REMOVE':
      newState = groupRemove(state, action, root);
      break;
    case 'ACCOUNT_SAVE':
      newState = accountSave(state, action, root);
      break;
    default:
      newState = clone(state || {});
    //(newState.accounts.liabilities || []).forEach(x => x.selected = false);
  }

  return newState || state || {};
}

export default app;
export {
  receiveAccounts, receiveAccountsData, receiveAccountsSave, menuSelect,
  selectAccountClick, groupClick, groupRemove, accountSave
};
