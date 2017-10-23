// should be getByTitle
var getByName = function(data, title){
  return data.filter(function(val,i,arr){ return val.title.toLowerCase().indexOf(title) >= 0; })[0];
}

var formatMoney = function(amount){
  if (!amount){
    return "$0.00";
  }
  amount = amount.toString().replace(/[$,]+/g,"");
  amount = (Number(amount) >= 0 ? "$" :"-$")
    + parseFloat(Math.abs(amount)).toFixed(2);
  amount = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ","); //COMMAS
  return amount;
};

var unFormatMoney = function(money){
  var amount = Number(money.replace(/[$,]+/g,""));
  return amount;
}

function formatAccountData(data){
    window.MAIN_DATA = data;

    MAIN_DATA.liabilities.getByName = title => getByName(MAIN_DATA.liabilities, title);
    MAIN_DATA.assets.getByName = title => getByName(MAIN_DATA.assets, title);

    var liabilities = MAIN_DATA.liabilities;
    var assets = MAIN_DATA.assets;

    var totals = {
      balance: data.scraped.data.accounts[0].balance,
      pending: MAIN_DATA.totals.pendingTotal,
      due: MAIN_DATA.totals.dueTotal,
      assets: MAIN_DATA.totals.assetsTotal,
      debts: MAIN_DATA.totals.debts,
      debtTotal: MAIN_DATA.totals.debtsTotal
    };
    return {liabilities, assets, totals};
}
