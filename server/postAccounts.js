/*
consider the following libraries:

https://github.com/benjamine/jsondiffpatch

https://github.com/flitbit/diff

https://www.npmjs.com/package/diff-json

*/
/* eslint-disable no-console */

var fs = require('fs');
var diff = require('diff-json').diff;
var moment = require('moment');

function saveAccounts(data){
	var jsonFile = require('path').join(__dirname + '/../accounts.json');
	var logFile = require('path').join(__dirname + '/../diffs.log');

	// simple check to make sure data is clean and safe
	var dataOkayToSave = data
		&& data.hasOwnProperty('balance')
		&& data.hasOwnProperty('assets')
		&& data.hasOwnProperty('liabilities');
	if (dataOkayToSave){
		var oldData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
		var newData = {
			balance: data.balance,
			assets: data.assets,
			liabilities: data.liabilities
		};
		var delta = diff(oldData, newData, {liabilities: 'title', assets: 'title'});
		var date = moment().format()
			.replace('T', '_')
			.replace(/:/g, '')
			.replace(/-/g, '')
			.slice(0, 13);
		fs.appendFileSync(logFile, JSON.stringify({ date, delta })+'\n');

		fs.writeFileSync(
			jsonFile,
			JSON.stringify(newData, null, '\t')
			,'utf8'
		);
	} else {

		console.log('-------------- data not okay to save: balance', data.hasOwnProperty('balance'));
		console.log('-------------- data not okay to save: assets', data.hasOwnProperty('assets'));
		console.log('-------------- data not okay to save: liabilities', data.hasOwnProperty('liabilities'));
	}
}

// TODO: use express body parsing to get json instead of node style
// already tried this and failed because (I think) the proxied call
function postAccounts (req, res){
	try {
		saveAccounts(req.body);
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end('post received');
	} catch (error) {
		res.writeHead(400, {'Content-Type': 'text/html'});
		res.end(error.toString());
	}
}

module.exports = postAccounts;
