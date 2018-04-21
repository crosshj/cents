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

function clone(item) {
    return JSON.parse(JSON.stringify(item));
}

export {
    clone,
    getByName,
    formatMoney,
    unFormatMoney,
    safeAccess
};