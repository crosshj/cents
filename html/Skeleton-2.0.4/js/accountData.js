// should be getByTitle
var getByName = function(title){
  return this.filter(function(val,i,arr){ return val.title.toLowerCase().indexOf(title) >= 0; })[0];
}

function formatAccountData(data){
    window.MAIN_DATA = data;

    MAIN_DATA.liabilities = MAIN_DATA.liabilities.map(function(item){
      if (item.status.toLowerCase() === 'paid' && new Date(item.date) <= new Date()){
        item.status = "Due";
      }
      return item;
    });

    MAIN_DATA.liabilities.getByName = getByName;
    MAIN_DATA.assets.getByName = getByName;

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
    var totals = [];
    return {liabilities, assets, totals};
}