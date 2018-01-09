var fs = require('fs');
var path = require('path');
var DEBUG = false;

function getAccountsFileName() {
  const accountsFile = path.resolve(__dirname, '../accounts.json');

  const useDefault = (() => {
    var _useDefault = true;
    if (fs.existsSync(accountsFile)) {
      DEBUG && console.log('--- account file exists');
      try {
        var accountsFileRead = fs.readFileSync(accountsFile).toString();
        if (!accountsFileRead) {
          DEBUG && console.log('--- account file is empty');
          throw 'empty accounts.json file';
        }

        var accountData = JSON.parse(accountsFileRead);
        if (
          accountData
          && accountData.hasOwnProperty('balance')
          && accountData.hasOwnProperty('assets')
          && accountData.hasOwnProperty('liabilities')
        ) {
          DEBUG && console.log('--- accounts file does not have proper props');
          _useDefault = false;
        }
      } catch (e) {
        DEBUG && console.log('--- error while checking accounts file:\n', e);
        // nothing to do, just use default
      }
    }
    return _useDefault
  })();

  DEBUG && console.log('Will use accounts.default.json: ', useDefault);

  return useDefault
    ? path.join(__dirname, '/../accounts.default.json')
    : accountsFile;
}

function updateGroups(accounts){
    var groupedLiabs = accounts.liabilities
      .filter(x => x.type === 'group')
      .reduce((all, one) => all.concat(one.items.map(i=>i.title)), []);
    accounts.liabilities.forEach(function(element) {
      if(element.type === 'group'){
        return;
      }
      element.type = undefined;
      if(groupedLiabs.includes(element.title)){
        element.type = 'grouped';
      }
    });
    return accounts;
}

function updateAccounts(accounts) {
  var u = JSON.parse(JSON.stringify(accounts));

  // AUTO MARK DUE and PAID
  var today = new Date();
  var oneWeekAhead = new Date().setDate(today.getDate() + 7);
  var paycheck = accounts.assets
    .filter(x => x.title.toLowerCase() === 'paycheck')[0];
  var payDate = new Date(paycheck.date);
  u.liabilities = u.liabilities.map(function (item) {
    if (!item.status || item.type === 'group'){
      item.status = 'paid';
      return item;
    }

    if (item.status.toLowerCase() === 'paid' && new Date(item.date) <= oneWeekAhead && new Date(item.date) < payDate) {
      console.log('item.date', item.date);
      console.log('paycheck.date', paycheck.date);
      item.status = "due";
      //console.log(item);
      if(item.auto){
        item.status = "pending";
      }
    }
    return item;
  });

  // auto-mark group status based on child items
  u.liabilities = u.liabilities.map(function (item) {
    if (item.type !== 'group'){
      return item;
    }

    const groupedItemsNames = item.items.map(x => x.title);
    const groupedItems = u.liabilities.reduce((all, account) => {
      if (groupedItemsNames.includes(account.title)){
        all.push(account);
      }
      return all;
    }, []);

    const groupStatus = groupedItems.reduce((status, g) => {
      status = g.status.toLowerCase() === 'due' ? 'due' : status;
      status = g.status.toLowerCase() === 'pending' && status !== 'due'
        ? 'pending'
        : status;
      return status;
    }, item.status);
    item.status = groupStatus;

    return item;
  });



  // SORT LIABILITIES
  var pending = u.liabilities.filter(function (a) {
    return a.status && a.status.toLowerCase() === 'pending'
  }).sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });
  var paid = u.liabilities.filter(function (a) {
    return a.status ? a.status.toLowerCase() === 'paid' : a.status
  }).sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });
  var due = u.liabilities.filter(function (a) {
    return a.status && a.status.toLowerCase() === 'due'
  }).sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });
  u.liabilities = [].concat(due, pending, paid);

  u.totals = {};
  u.totals.pendingTotal = pending
    .filter(item => !(JSON.parse(item.hidden) || item.type === 'group'))
    .reduce((all, one) => all + Number(one.amount), 0);
  u.totals.dueTotal = due
    .filter(item => !(JSON.parse(item.hidden) || item.type === 'group'))
    .reduce((all, one) => all + Number(one.amount), 0);
  u.totals.assetsTotal = u.assets
    .filter(item => !JSON.parse(item.hidden))
    .reduce((all, one) => all + Number(one.amount), 0);
  u.totals.debts = u.liabilities
    .filter(item => !(JSON.parse(item.hidden) || item.type === 'group'))
    .reduce((all, one) => all + Number(one.amount), 0);
  u.totals.debtsTotal = u.liabilities
    .filter(item => !(JSON.parse(item.hidden) || item.type === 'group'))
    .reduce((all, one) => all - Number(one.total_owed), 0);

  u = updateGroups(u);

  return u;
}

module.exports = {
  getAccountsFileName,
  updateAccounts
};