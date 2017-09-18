var fs = require('fs');
var path = require('path');
var DEBUG = false;

function getAccountsFileName(){
  const accountsFile = path.resolve(__dirname, '../accounts.json');

  const useDefault = (() => {
    var _useDefault = true;
    if (fs.existsSync(accountsFile)){
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
        ){
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

module.exports = {
  getAccountsFileName
};