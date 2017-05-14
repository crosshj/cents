// should be getByTitle
var getByName = function(data, title){
  return data.filter(function(val,i,arr){ return val.title.toLowerCase().indexOf(title) >= 0; })[0];
}

var formatMoney = function(amount){
  amount = amount.toString().replace(/[$,]+/g,"");
  amount = (Number(amount) >= 0 ? "$" :"-$")
    + parseFloat(Math.abs(amount)).toFixed(2);
  amount = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ","); //COMMAS
  return amount
};

var unFormatMoney = function(money){
  var amount = Number(money.replace(/[$,]+/g,""));
  return amount;
}

function formatAccountData(data){
    window.MAIN_DATA = data;

    var today = new Date();
    var oneWeekAhead = new Date().setDate(today.getDate()+7);
    MAIN_DATA.liabilities = MAIN_DATA.liabilities.map(function(item){
      if (item.status.toLowerCase() === 'paid' && new Date(item.date) <= oneWeekAhead){
        item.status = "due";
      }
      return item;
    });

    MAIN_DATA.liabilities.getByName = title => getByName(MAIN_DATA.liabilities, title);
    MAIN_DATA.assets.getByName = title => getByName(MAIN_DATA.assets, title);

    var pending = MAIN_DATA.liabilities.filter(function(a){
      return a.status.toLowerCase() === 'pending'
    }).sort(function(a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    var paid = MAIN_DATA.liabilities.filter(function(a){
      return a.status.toLowerCase() === 'paid'
    }).sort(function(a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    var due = MAIN_DATA.liabilities.filter(function(a){
      return a.status.toLowerCase() === 'due'
    }).sort(function(a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    var liabilities = [].concat(due, pending, paid);
    var assets = MAIN_DATA.assets;

    var pendingTotal = pending
        .filter(item => !JSON.parse(item.hidden))
        .reduce((all, one) => all + Number(one.amount), 0);
    var dueTotal = due
        .filter(item => !JSON.parse(item.hidden))
        .reduce((all, one) => all + Number(one.amount), 0);
    var assetsTotal = assets
        .filter(item => !JSON.parse(item.hidden))
        .reduce((all, one) => all + Number(one.amount), 0);
    var debts = liabilities
        .filter(item => !JSON.parse(item.hidden))
        .reduce((all, one) => all + Number(one.amount), 0);
    var debtsTotal = liabilities
        .filter(item => !JSON.parse(item.hidden))
        .reduce((all, one) => all - Number(one.total_owed), 0);

    var totals = {
      balance: data.scraped.data.accounts[0].balance,
      pending: pendingTotal,
      due: dueTotal,
      assets: assetsTotal,
      debts: debts,
      debtTotal: debtsTotal
    };
    return {liabilities, assets, totals};
}
