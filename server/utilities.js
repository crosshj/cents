var fs = require('fs');
var path = require('path');

function getAccountsFileName(){
  const accountsFile = path.join(__dirname, '/../accounts.json');
  return fs.existsSync(accountsFile)
    ? path
    : path.join(__dirname, '/../accounts.default.json');
}

module.exports = {
  getAccountsFileName
};