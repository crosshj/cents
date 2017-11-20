
const getPrivateInfo = require('../../utilities/getPrivateInfo');
const scrapers = require('./scrapers')(getPrivateInfo);

scrapers.usaa(function(err, res){
  console.log(`USAA balance = ${res.balance}`);
  console.log(`USAA transactions = ${res.transactions.length}`);
});
