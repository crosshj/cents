var zlib = require('zlib');
var fs = require('fs');
var getAccountsFileName = require('./utilities').getAccountsFileName;

const getJSON = function(req, res){
  // not gzipped, using centslib
  //var jsonFile = c.getAccounts();
  //res.writeHead(200, {'Content-Type': 'application/json'});
  //res.end(JSON.stringify(jsonFile));

  // gzipped, using stream
  const accountsfileName = getAccountsFileName();
  var raw = fs.createReadStream(accountsfileName);
    res.writeHead(200, {
      'content-encoding': 'gzip',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    raw.pipe( zlib.createGzip() ).pipe(res);
};

module.exports = getJSON;
