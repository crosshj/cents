import {
  fetchHistory
} from './js/services';

import {
  clone,
  updateGroupFromChildren,
  safeAccess,
  fixTotals,
  openGroupedAccounts,
  bumpDateOneMonth,
  bumpDateOneMonthBack,
  statToNumber
} from './js/redux/utilities.js';

function popup(state, action) {
  var newState = undefined;
  var history = undefined;

  switch (action.type) {
    case 'RECEIVE_ACCOUNTS':
      if (action.payload.error) {
        newState = Object.assign({}, state, action.payload);
        break;
      }
      var stateAccounts = clone(action.payload) || {};
      (stateAccounts.liabilities || []).forEach(x => {
        if (x.hidden === 'false') {
          x.hidden = false;
        }
      });
      stateAccounts = updateGroupFromChildren(stateAccounts);
      stateAccounts.totals = safeAccess(() => state.totals) || {};
      stateAccounts.totals.balance = safeAccess(() => state.totals.balance) || 0;
      stateAccounts.totals.updating = true;
      stateAccounts = fixTotals(stateAccounts);
      stateAccounts = openGroupedAccounts(accounts, state && !state.error ? state : stateAccounts);

      if (state && typeof state.selectedMenuIndex === "undefined") {
        stateAccounts.selectedMenuIndex = window && window.localStorage
          ? Number(localStorage.getItem('selectedTab'))
          : 0;
      } else {
        stateAccounts.selectedMenuIndex = state ? state.selectedMenuIndex : 0;
      }
      newState = stateAccounts;
      break;
    case 'RECEIVE_HISTORY':
      newState = clone(state);
      if (action.payload.error) {
        newState.history = { error: action.payload.error };
        break;
      }
      newState = clone(state);
      newState.history.error = false;
      newState.history.data = action.payload;
      break;
    case 'POPUP_ACCOUNT':
      dateDirty = false;
      account = [].concat((accounts.liabilities || []), (accounts.assets || []))
        .filter(a => a.title.toLowerCase() === action.payload.title.toLowerCase());
      account = account[0];
      if (account.items) {
        if (selected && selected.length) {
          selected
            .forEach(x => {
              if (!account.items
                .map(y => y.title.toLowerCase())
                .includes(x.title.toLowerCase())
              ) {
                account.items.push(clone(x))
              }
            })
        }
        account.items = account.items
          .map(x => {
            return accounts.liabilities.filter(y => y.title === x.title)[0]
          })
          .sort((a, b) => b.total_owed - a.total_owed);
      }
      newState = Object.assign({}, state, {
        error: account ? false : 'could not find account',
        account: clone(account || false)
      });
      break;
    case 'POPUP_UPDATE':
      newState = clone(state);
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
        const isOldPaid = state.account.status.toLowerCase() === 'paid';
        const shouldAutoReduce = !!state.account.autoReduce;

        if (isOldPaid && dateDirty) {
          newState.account.date = bumpDateOneMonthBack(newState.account.date);
          dateDirty = false;
          if (shouldAutoReduce) {
            newState.account.total_owed += Number(newState.account.amount);
          }
        }

        if (!isOldPaid && isNewPaid) {
          newState.account.date = bumpDateOneMonth(newState.account.date);
          dateDirty = true; //TODO: should not be dirty if original status was paid
          if (shouldAutoReduce) {
            newState.account.total_owed -= Number(newState.account.amount);
          }
        }
      }
      account = newState.account;
      break;
    case 'POPUP_NEW_GROUP':
      dateDirty = false;
      var selectedAmount = selected.reduce((all, g) => { return all + Number(g.amount); }, 0);
      selectedAmount = parseFloat(selectedAmount).toFixed(2);
      var selectedOwed = selected.reduce((all, g) => { return all + Number(g.total_owed || 0); }, 0);
      selectedOwed = parseFloat(selectedOwed).toFixed(2);
      var selectedLatestDate = selected
        .map(x => x.date)
        .sort(function (a, b) {
          return new Date(a.date) - new Date(b.date);
        })[0];
      account = {
        type: "group",
        hidden: false,
        title: "New Group",
        note: "",
        items: selected,
        isNew: true,
        status: "paid", // TODO: update from selected accounts
        date: selectedLatestDate,
        amount: selectedAmount,
        total_owed: selectedOwed,
        auto: false
      };
      newState = Object.assign({}, state, {
        error: false,
        account: JSON.parse(JSON.stringify(account || false))
      });
      break;
    case 'POPUP_NEW_ACCOUNT':
      dateDirty = false;
      account = {
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
        account: JSON.parse(JSON.stringify(account || false))
      });
      break;
    case 'POPUP_CANCEL':
      account = undefined;
      history = undefined;
      dateDirty = false;
      newState = Object.assign({}, state, { error: 'not initialized', account, history })
      break;
    case 'POPUP_HISTORY': {
      const { field } = action.payload;
      const title = (account || {}).title || 'Total Owed';
      history = { error: 'loading', field, title };
      newState = Object.assign({}, state, { account, history, error: false });
      const type = account ? 'liabilities' : 'balance'; //TODO: get type in a better way
      fetchHistory({ type, title, field });
      break;
    }
    case 'POPUP_HISTORY_BACK':
      history = undefined;
      newState = Object.assign({}, state, { account, history, error: false })
      break;
    case 'GROUP_REMOVE':
      account = undefined;
      newState = Object.assign({}, state, { error: 'not initialized', account: undefined })
      break;
    case 'REMOVE_ITEM': {
      newState = clone(state);
      const itemTitle = action.payload.title;
      newState.account.items = newState.account.items
        .filter(x => x.title.toLowerCase() !== itemTitle.toLowerCase());

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

      account = newState.account;
      break;
    }
    case 'ACCOUNT_SAVE':
      dateDirty = false;
      newState = Object.assign({}, state, { error: 'not initialized' });
      delete newState.account;
      break;
  }
  return newState || state || {};
}

export default popup;
