// should be getByTitle
var getByName = function(data, title){
  return data.filter(function(val,i,arr){ return val.title.toLowerCase().indexOf(title) >= 0; })[0];
};

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
};

var safeAccess = (fn) => {
  var response = undefined;
  try {
    response = fn();
  } catch (error) {
    // nothing
  }
  return response;
};

function formatAccountData(data){
  window.MAIN_DATA = data || {};
  window.MAIN_DATA.liabilities = window.MAIN_DATA.liabilities || [];
  window.MAIN_DATA.assets = window.MAIN_DATA.assets || [];

  MAIN_DATA.liabilities.getByName = title => getByName(MAIN_DATA.liabilities, title);
  MAIN_DATA.assets.getByName = title => getByName(MAIN_DATA.assets, title);

  var liabilities = MAIN_DATA.liabilities;
  var assets = MAIN_DATA.assets;

  var totals = {
    balance: safeAccess(() => data.scraped.data.accounts[0].balance) || 0,
    pending: safeAccess(() => MAIN_DATA.totals.pendingTotal) || 0,
    due: safeAccess(() => MAIN_DATA.totals.dueTotal) || 0,
    assets: safeAccess(() => MAIN_DATA.totals.assetsTotal) || [],
    debts: safeAccess(() => MAIN_DATA.totals.debts) || [],
    debtTotal: safeAccess(() => MAIN_DATA.totals.debtsTotal) || 0
  };
  return {liabilities, assets, totals};
}
