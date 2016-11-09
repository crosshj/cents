/*

dropbox access token (see ./_private/access_token)

Browse DataStores:
https://www.dropbox.com/developers/browse_datastores/616744?_subject_uid=25275512

https://www.dropbox.com/developers/datastore/docs/

https://www.dropbox.com/developers/datastore/tutorial/http

*/

(function() {
	var request = require('request');
	var _access_token =  require('./_private/access_token').token;
console.log("---------------------------");
console.log(_access_token);

	var get_or_create_datastore = function(access_token, datastoreName, callback){
			access_token = access_token || _access_token;
			var reqoptions = {
			    url: 'https://api.dropbox.com/1/datastores/get_or_create_datastore',
			    method: "POST",
			    headers: {
			    	"Authorization" : "Bearer " + access_token
			    },
			    qs: { dsid : datastoreName}    
			};
			request(reqoptions, callback);
		};
	var list_datastores = function(access_token, callback){
			access_token = access_token || _access_token;
			var reqoptions = {
			    url: 'https://api.dropbox.com/1/datastores/list_datastores',
			    method: "GET",
			    headers: {
			    	"Authorization" : "Bearer " + access_token,
			    }    
			};
			request(reqoptions, callback);
		};
	var get_snapshot = function(handle, access_token, callback){
			access_token = access_token || _access_token;
			var reqoptions = {
			    url: 'https://api.dropbox.com/1/datastores/get_snapshot',
			    method: "GET",
			    headers: {
			    	"Authorization" : "Bearer " + access_token,
			    },
			    qs: { handle : handle}    
			};
			request(reqoptions, callback);
		};
	var put_delta = function(handle, access_token, revision, changes, callback){
			access_token = access_token || _access_token;
			var reqoptions = {
			    url: 'https://api.dropbox.com/1/datastores/put_delta',
			    method: "POST",
			    headers: {
			    	"Authorization" : "Bearer " + access_token,
			    },
			    qs: 
			    { 
			    	handle : handle,
			    	rev : revision,
		    		changes : JSON.stringify(changes)
		    	}    
			};
			request(reqoptions, callback);
		};
	var get_deltas = function(handle, access_token, revision, callback){
			access_token = access_token || _access_token;
			var reqoptions = {
			    url: 'https://api.dropbox.com/1/datastores/get_deltas',
			    method: "GET",
			    headers: {
			    	"Authorization" : "Bearer " + access_token,
			    },
			    qs: 
			    { 	
			    	handle : handle,
			    	rev : revision
		    	}    
			};
			request(reqoptions, callback);
		};
	var put_delta_TEST = function(handle,access_token,revision){
	    access_token = access_token || _access_token;
	    /*
			<change>            ::= ["I", <tid>, <recordid>, <datadict>]  # INSERT
			                      | ["U", <tid>, <recordid>, <opdict>]  # UPDATE
			                      | ["D", <tid>, <recordid>]  # DELETE

			<opdict>            ::= {<field>: <fieldop>, ...}

			<fieldop>           ::= ["P", <value>]  # PUT
			                      | ["D"]  # DELETE
			                      | ["LC"] # LIST_CREATE
			                      | ["LP", <index>, <atom>]  # LIST_PUT
			                      | ["LI", <index>, <atom>]  # LIST_INSERT
			                      | ["LD", <index>]  # LIST_DELETE
			                      | ["LM", <index>, <index>]  # LIST_MOVE
		*/
	    var changes = [
	    		[
			        "I",
			        "superfantastic",
			        "DATA",
			        { boo : "yehyehyeh", what : "okay"}
			    ]
			];
	    put_delta(handle,access_token,revision,changes, function (error,response,body) {
	    	console.log(body);
	    });
	};		
	var testDataStore = function(){
			var access_token = _access_token;
			list_datastores(access_token, function(error, response, body) {
			    var datastores = JSON.parse(body).datastores;
			    if(error || !datastores){
			    	console.log("FAIL TO LIST DATASTORES");
			    	return;
			    }
		    	console.log("found "+ datastores.length + " datastores");
				var util = require('util');
		    	console.log(util.inspect(datastores, { showHidden: true, depth: null }));
		    	var datastoreName = "superfantastic";
		    	get_or_create_datastore(access_token, datastoreName, function(error, response, body) {
				    var handle = JSON.parse(body).handle;
				    if(error || !handle){
				    	console.log("FAIL TO GET OR CREATE DATASTORE");
				    	return;
				    }
				    console.log("got handle for "+ datastoreName+ " = "+ handle);
		    	    get_snapshot(handle,access_token,function(error,response,body){
				    	var b = JSON.parse(body);
					    if (error || !b.rows || typeof b.rev != 'number'){
					    	console.log("FAIL TO GET SNAPSHOT");
					    	return;
					    }
					    console.log("got snapshot : "+ b.rows.length + " rows, revision "+ b.rev);
					    console.log(util.inspect(b, { showHidden: true, depth: null }));
					    for (var i = b.rows.length - 1; i >= 0; i--) {
					    	console.log(b.rows[i]);
					    };
					    var revision = b.rev;
					    put_delta_TEST(handle,access_token,revision);
					    var changesSinceRevision = 0;
					    get_deltas(handle,access_token,changesSinceRevision, function (error,response,body) {
					    	console.log(body);
					    });
			    	});
				});
		    
			});
		};


	module.exports = {
		access_token : _access_token,
		handles : {},
		revisions : {},

		// wrapped
		list_datastores : list_datastores,
		get_datastore : null,
		get_or_create_datastore : get_or_create_datastore,
		create_datastore : null,
		delete_datastore : null,
		get_deltas : get_deltas,
		put_delta : put_delta,
		get_snapshot : get_snapshot,
		await : null,
		
		// convenience
		testDataStore : testDataStore,
		put_delta_TEST : put_delta_TEST,
		search_delta : null,
		search_datastore : null
	};

})();
