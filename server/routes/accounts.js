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

var getAccountsFileName = require('../utilities').getAccountsFileName;
var updateAccounts = require('../utilities').updateAccounts;

var jsonFile = require('path').resolve(__dirname, '../../accounts.json');
var logFile = require('path').resolve(__dirname, '../../diffs.log');

var db = require('../../service/database');

function getJSON(req, res) {
	const accountsFileName = getAccountsFileName();
	let accounts = JSON.parse(fs.readFileSync(accountsFileName));
	accounts = updateAccounts(accounts);
	res.json(accounts);
}

function getAccounts(req, res) {
	const noDBerror = {
		error: 'no accounts info available from DB',
		data: { accounts: [{}] }
	};
	db.init({
		collectionName: 'records',
		callback: () => {
			db.read({
				query: '',
				callback: (err, result) => {
					res.json(
						result.length === 0
							? noDBerror
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
		var oldData = undefined;
		try {
			oldData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
		} catch (e) {
			oldData = {};
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

		data.balance = data.balance.filter(x => x.title !== "Total Owed");
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

function postAccounts(req, res) {
	try {
		saveAccounts(req.body, () => {
			res.json({status: 'accounts saved'});
		});
	} catch (error) {
		res.json(error.toString());
	}
}

module.exports = function (app, passport) {
	app.get('/json', passport.authenticationMiddleware(), getJSON);
	app.get('/accounts', passport.authenticationMiddleware(), getAccounts);
	app.post('/accounts', passport.authenticationMiddleware(), postAccounts);
};
