var inspect = require('util').inspect;
var dropbox = require('./cents.dropbox');

function getAccounts(){
	var jsonFile = require('path').join(__dirname + '/accounts.json');
	var accountsJson = JSON.parse(require('fs').readFileSync(jsonFile,'utf8'));
	return accountsJson;
}

var accounts = getAccounts();

function dataStoresRequest(error,response, body){
	if(error){
		console.log("FAIL BEFORE DATASTORES REQUEST");	
	}
	// call drop lib here
	dropbox.list_datastores(null, getDataStoresToAdd);
	//getDataStoresToAdd(null,null,'{ "datastores" : ["default","superfantastic","test"] }');
}

// verify accounts main structure have data stores and relevant info is in each datastore
function getDataStoresToAdd(error, response, body){
	var datastores = JSON.parse(body).datastores.map(function(value){ dropbox.handles[value.dsid]=value.handle; return value.dsid; });
    console.log(inspect(datastores));
    var accounts = getAccounts();
    if(error || !datastores){
    	console.log("FAIL TO LIST DATASTORES");
    	return;
    }
	var toAdd = [];
	for(var propertyName in accounts) {
	   // propertyName is what you want
	   // you can get the value like this: myObject[propertyName]
		if (datastores.indexOf(propertyName) < 0){
			toAdd.push(propertyName);
		}
	}
	if (toAdd.length > 0){
		// call function to add datastores here
		//get_or_create_datastore(access_token, datastoreName,etc << callback for this calls dataStoresRequest and starts process again
		dropbox.get_or_create_datastore(null,toAdd[0],dataStoresRequest)
		console.log(inspect(toAdd));
	} else {
		// call function to kick off the following 
		console.log('--- ALL NEEDED DATASTORES EXIST');
		//console.log(inspect(dropbox.handles));
		getAccountRows(accounts);
	}
	
}

// used for each account to get rows
function snapshotResponse(error, response, body){
	if(error){
		console.log("FAIL TO GET SNAPSHOT");	
	}
	responseRows = JSON.parse(body).rows;
	
	console.log(inspect(body));
	accountsRows = (responseRows.length > 0) ? accountsRows.concat(responseRows) : accountsRows;
	var handle = response.request.url.query.replace("handle=","");
	var requestedDataStore;
	for(var propName in dropbox.handles){
		if (dropbox.handles[propName]==handle){
			requestedDataStore = propName;
			break;
		}
	}
	console.log(inspect(requestedDataStore));
	dropbox.revisions[requestedDataStore] = JSON.parse(body).rev;

	// remove requestedDataStore
	var index = accountsLeftToGetRows.indexOf(requestedDataStore);
	accountsLeftToGetRows.splice(index, 1);
	
	getAccountRows(accountsLeftToGetRows);
}

var accountsLeftToGetRows;
var accountsRows = [];
function getAccountRows(accounts){
	// for all items in each account property (balance, assets, liabilities)
	// either insert or update based on snapshot got from request (or from information in get_deltas), only if needed
	accountsLeftToGetRows = (Object.prototype.toString.call(accounts).toLowerCase().indexOf("array") == -1) 
								? Object.getOwnPropertyNames(accounts).concat(["superfantastic"]) 
								: accounts;
	//console.log(inspect(accounts));
	//console.log(dropbox.handles[accountsLeftToGetRows[0]]);
	//var gettingAccount = accountsLeftToGetRows[0];
	if (accountsLeftToGetRows.length > 0){
		dropbox.get_snapshot(dropbox.handles[accountsLeftToGetRows[0]], null, snapshotResponse);
	} else {
		console.log("FINISHED GETTING ACCOUNT ROWS FROM SERVER");
		var deltas = getDeltas(accountsRows);
		if (!deltas || deltas.length <= 0) {
			console.log("-- no changes to be made");
			return;
		}
		var _accounts = getAccounts();
		for(var section in _accounts) {
			var handle = dropbox.handles[section];
			var access_token = null;
			var revision = dropbox.revisions[section];
			var changes = deltas.filter(function(a){
				return a[1].indexOf(section) == 0;
			});
			if (!!changes && changes.length > 0){
				console.log(inspect(changes));
				dropbox.put_delta(handle,access_token,revision,changes, function (error,response,body) {
			    	console.log(body);
			    });	
			}
			
		}
	}
	
}

function getDeltas(accountsRows){
	//console.log(accountsRows);
	//console.log("-- TODO: look at what rows are on server and compare those with what needs added/updated from local, create a DELTA and push to server");
	var accounts = getAccounts();	
	
	var deltas = [];

	for(var section in accounts) {
	   	var rows = accounts[section];
	   	console.log("-- " + section);
		for(var row in rows) {
			var id = rows[row].title.toLowerCase().replace(/ /g,"_");
			var existingMatches = accountsRows.filter(function(a){   return a.tid.indexOf(section)!=-1 && a.rowid.indexOf(id)!=-1; });
			var change = [];
			if(!existingMatches || existingMatches.length <= 0) { 
				//console.log("-- INSERT row in dropbox: " + section + "/" + id);
				change = [
			        "I",
			        section,
			        id,
			        rows[row]
			    ]
			    deltas.push(change);
			}
			if(!!existingMatches && existingMatches.length > 0){
				console.log("-- TODO: if not equal, UPDATE row in dropbox: " + section + "/" + id);	
				
			} 
			//console.log("\t"+id);
		}
		console.log("-- TODO: delete rows that should not exist");
	}
	//console.log(inspect(deltas));
	return deltas;
}


dataStoresRequest();


