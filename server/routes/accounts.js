/*
consider the following libraries for diffs:

https://github.com/benjamine/jsondiffpatch

https://github.com/flitbit/diff

https://www.npmjs.com/package/diff-json

*/
/* eslint-disable no-console */

var fs = require('fs');
var diff = require('diff-json').diff;
var moment = require('moment');
var zlib = require('zlib');

var getAccountsFileName = require('../utilities').getAccountsFileName;
var jsonFile = require('path').resolve(__dirname, '../../accounts.json');
var logFile = require('path').resolve(__dirname, '../../diffs.log');

var db = require('../../service/database');

function getJSON (req, res){
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
}

function getAccounts(req, res) {
	db.init({
		collectionName: 'records',
		callback: () => {
			db.read({
				query: '',
				callback: (err, result) => {
					res.send(
						result.length === 0
							? {
								error: 'no accounts info available from DB',
								data: { accounts: [{}] }
							}
							: result[result.length - 1]
					);
				}
			});
		}
	});
}

function saveAccounts(data, callback) {
	// simple check to make sure data is clean and safe
	var dataOkayToSave = data
		&& data.hasOwnProperty('balance')
		&& data.hasOwnProperty('assets')
		&& data.hasOwnProperty('liabilities');
	if (dataOkayToSave) {
		var oldData = {};
		try {
			oldData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
		} catch (e) {
			// nothing to do
		}

		const oldTotal = oldData.liabilities
			.filter(item => !JSON.parse(item.hidden))
			.reduce((all, one) => all + Number(one.total_owed), 0);
		oldData.balance.push({
			"title": "Total Owed",
			"amount": oldTotal
		});

		const newTotal = data.liabilities
			.filter(item => !JSON.parse(item.hidden))
			.reduce((all, one) => all + Number(one.total_owed), 0);
		data.balance.push({
			"title": "Total Owed",
			"amount": newTotal
		});

		var newData = {
			balance: data.balance,
			assets: data.assets,
			liabilities: data.liabilities
		};

		var delta = diff(oldData, newData, { liabilities: 'title', assets: 'title', balance: 'title' });
		var date = moment().format()
			.replace('T', '_')
			.replace(/:/g, '')
			.replace(/-/g, '')
			.slice(0, 13);
		fs.appendFileSync(
			logFile,
			JSON.stringify({ date, delta }) + '\n',
			{ encoding: 'utf8', flag: 'a+' }
		);

		fs.writeFile(
			jsonFile,
			(JSON.stringify(newData, null, '\t') || '').trim(),
			{ encoding: 'utf8', flag: 'w+' },
			callback
		);
	} else {
		console.log('-------------- data not okay to save: balance', data.hasOwnProperty('balance'));
		console.log('-------------- data not okay to save: assets', data.hasOwnProperty('assets'));
		console.log('-------------- data not okay to save: liabilities', data.hasOwnProperty('liabilities'));
	}
}

// TODO: use express body parsing to get json instead of node style
// already tried this and failed because (I think) the proxied call
function postAccounts(req, res) {
	try {
		saveAccounts(req.body, () => {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end('post received');
		});
	} catch (error) {
		res.writeHead(400, { 'Content-Type': 'text/html' });
		res.end(error.toString());
	}
}

module.exports = function (app, passport) {
	app.get('/json', passport.authenticationMiddleware(), getJSON);
	app.get('/accounts', passport.authenticationMiddleware(), getAccounts);
	app.post('/accounts', passport.authenticationMiddleware(), postAccounts);
};
