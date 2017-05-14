function saveAccounts(data){
	var jsonFile = require('path').join(__dirname + '/../accounts.json');
	
	// simple check to make sure data is clean and safe
	var dataOkayToSave = data
		&& data.hasOwnProperty('balance') 
		&& data.hasOwnProperty('assets') 
		&& data.hasOwnProperty('liabilities');
	if (dataOkayToSave){
		require('fs')
			.writeFileSync(
				jsonFile,
				JSON.stringify(data, null, '\t')
				,'utf8'
			);
	}
}

function postAccounts (req, res){
	var body = '';
	req.on('data', function (data) {
		body += data;
	});
	req.on('end', function () {
		var data = JSON.parse(body);
		saveAccounts(data);
	});
		res.writeHead(200, {'Content-Type': 'text/html'});
	return res.end('post received');
};

module.exports = postAccounts;