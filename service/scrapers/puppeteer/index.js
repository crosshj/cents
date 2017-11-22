
const getPrivateInfo = require('../../utilities/getPrivateInfo');
const scrapers = require('./scrapers')(getPrivateInfo);

// scrapers.usaa(function(err, res){
//   console.log(`USAA balance = ${res.balance}`);
//   console.log(`USAA transactions = ${res.transactions.length}`);
// });

scrapers.discover(function(err, res){
  console.log(`Discover balance = ${res.balance}`);
  console.log(`Discover transactions = ${res.transactions.length}`);
});
