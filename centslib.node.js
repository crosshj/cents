// http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options -- RUN NODEJS FILES IN ANOTHER PROCESS!!!

function get(url) {
  var httpsync = require('httpsync');
  var req = httpsync.get(url);
  return req.end().data;
}

function _getBalances(accounts){
	var balance = [];
	var _uBal = get('localhost:/cents/accounts/usaa/balance');
	console.log(_uBal);
	var usaaBalance = JSON.parse(_uBal).balance||0;
	
	var totalAssets = parseFloat(accounts.assets.map(function(el) {
						return Number(el.amount)
					}).reduce(function(previousValue, currentValue, index, array) {
						return previousValue + currentValue;
					}, 0)).toFixed(2);
	var totalLiab = parseFloat(accounts.liabilities.map(function(el) {
						return Number(el.amount)
					}).reduce(function(previousValue, currentValue, index, array) {
						return previousValue + currentValue;
					}, 0)).toFixed(2);
	var totalOwed = parseFloat(accounts.liabilities.map(function(el) {
						return Number(el.total_owed)
					}).reduce(function(previousValue, currentValue, index, array) {
						return previousValue + currentValue;
					}, 0)).toFixed(2);
	var totalDue = parseFloat(accounts.liabilities.filter(function(el) {
						return el.status.toLowerCase().indexOf("due") != -1
					}).map(function(el) {
						return Number(el.amount)
					}).reduce(function(previousValue, currentValue, index, array) {
						return previousValue + currentValue;
					}, 0)).toFixed(2);
	var totalPending = parseFloat(accounts.liabilities.filter(function(el) {
						return el.status.toLowerCase().indexOf("pending") != -1
					}).map(function(el) {
						return Number(el.amount)
					}).reduce(function(previousValue, currentValue, index, array) {
						return previousValue + currentValue;
					}, 0)).toFixed(2);
	
	var balMinPend = usaaBalance - totalPending;
	var balMinPendDue = usaaBalance - totalPending - totalDue;

	balance.push({ title: "Total Assets", amount: totalAssets });
	balance.push({ title: "Total Liabilities", amount: totalLiab });
	balance.push({ title: "Total Owed", amount: totalOwed });
	
	if (totalDue > 0) {
		balance.push({ title: "Total Due", amount: totalDue });
	}
	if (totalPending > 0) {
		balance.push({ title: "Total Pending", amount: totalPending });
	}
	balance.push({ title: "Balance", amount: usaaBalance });
	if (totalPending > 0) {
		balance.push({ title: "Balance - Pending", amount: balMinPend });
	}
	if (totalDue > 0) {
		balance.push({ title: "Balance - Pend/Due", amount: balMinPendDue });
	}
	return balance;
}

function getAccounts(){
	var jsonFile = require('path').join(__dirname + '/accounts.json');
	var body = require('fs').readFileSync(jsonFile,'utf8');
	body = body.replace(/<script[^>]*>/gi, '<span style=\'color:red;\'>!!!BAD!!!</span>'); //TODO: sanitize or validate better than this
    body = body.replace(/<\//gi, '<\/\/');
	var accountsJson = JSON.parse(body);
	accountsJson.balance = _getBalances(accountsJson);
	return accountsJson;
}

function saveAccounts(data){
	var jsonFile = require('path').join(__dirname + '/accounts.json');
	//TODO: make sure data is clean since this will be read back out
	require('fs').writeFileSync(jsonFile,JSON.stringify(data, null, '\t'),'utf8');
}

var htmlFromJson = function(json){
	var indexFile = require('path').join(__dirname + '/index.htm');
	var htmlTemplate = require('fs').readFileSync(indexFile,'utf8');


	var TR_OPEN = "\n\t\t\t<tr";
	var TD_OPEN = "\n\t\t\t\t<td";
	var TR_CLOSE = "\n\t\t\t</tr>";

	var html = "<table>";
	var usaaURL = "https://mobile.usaa.com/inet/ent_logon/Logon";

	html+=( TR_OPEN + " class='header'>"+ TD_OPEN +" colspan='999'>"+"SUMMARY"+"</td>" + TR_CLOSE);
	json.balance.forEach(function(row){
		html+=( TR_OPEN + " class='standard summary' data-id='"+row.title+"'>"+ 
					TD_OPEN +">" +((row.title.toLowerCase() != "balance") ? row.title : '<a target="_blank" href="'+usaaURL+'">'+row.title+'</a>')+"</td>"+ 
					TD_OPEN +">$"+parseFloat(row.amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +"</td>"+
				TR_CLOSE);
	});
	
	html+="\n</table><table class='assetsLiabs'>";
	html+=( TR_OPEN + "  class='header'>"+ TD_OPEN +" colspan='999'>"+"LIABILITIES"+"</td>"+TR_CLOSE);
	json.liabilities.sort(function(a, b) {
			return new Date(a.date) - new Date(b.date);
		}).forEach(function(row){
			if( "true" != row.hidden ){
				var note = (row.note.length > 2) ? ("<div class='circle' title='"+row.note+"'>"+"i"+"</div>") : null;
				html+=( TR_OPEN + " class='standard' data-id='"+row.title+"'>"+ 
							TD_OPEN +">" +((!!row.website && row.website.length > 1) ? "<a target='_self' href='"+ row.website +"'>"+row.title+"</a>" : row.title )+(!!note ? note : "")+"</td>"+
							TD_OPEN +">$"+parseFloat(row.amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"</td>"+
							TD_OPEN +">" +row.status.toUpperCase()+"</td>"+
							TD_OPEN +">"+ new Date(row.date).toISOString().replace(/T(.*)$/,'') +"</td>"+
							TD_OPEN +">"+ ((row.total_owed && row.total_owed > 0) ? "$"+parseFloat(row.total_owed).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "") +"</td>"+ 
						TR_CLOSE );
			}
		});

	html+="\n</table><table class='assetsLiabs'>";
	html+=( TR_OPEN + " class='header'>"+ TD_OPEN +" colspan='999'>"+"ASSETS"+"</td>"+TR_CLOSE);
	json.assets.sort(function(a, b) {
			return new Date(a.date) - new Date(b.date);
		}).forEach(function(row){
			if( "true" != row.hidden ){
				var note = (row.note.length > 2) ? ("<div class='circle' title='"+row.note+"'>"+"i"+"</div>") : null;
				html+=( TR_OPEN + " class='standard' data-id='"+row.title+"'>"+ 
							TD_OPEN +">" +((!!row.website && row.website.length > 1) ? "<a target='_self' href='"+ row.website +"'>"+row.title+"</a>" : row.title )+(!!note ? note : "")+"</td>"+
							TD_OPEN +">$"+parseFloat(row.amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+"</td>"+
							TD_OPEN +">" +row.status.toUpperCase()+"</td>"+
							TD_OPEN +">"+ new Date(row.date).toISOString().replace(/T(.*)$/,'') +"</td>"+
							TD_OPEN +">"+ ((row.total_owed && row.total_owed > 0) ? "$"+parseFloat(row.total_owed).toFixed(2) : "") +"</td>"+ 
						TR_CLOSE);
			}
		});

	html+="\n\t\t</table>";

	html = htmlTemplate.replace("{{MAIN_TABLE}}",html);

	return html;

};

(function() {
	module.exports = {
		base: function() {
			this.base = this;
			return this;
		},
		fs: require('fs'),
		xml2js: require('xml2js'),

		accountsData: null,
		json : ["no data"],

		getAccounts : getAccounts,
		saveAccounts : saveAccounts,
		htmlFromJson : htmlFromJson,


		liabList: function() {
			return this.accountsData.accounts.liabilities[0].item;
		},
		assetsList: function() {
			return this.accountsData.accounts.assets[0].item;
		},
		balanceList: function() {
			return this.accountsData.accounts.balance[0].item;
		},
		links: function() {
			return "[TODO]\n" + "\thttp://crosshj.synology.me:314/cents/accounts/usaa/summary";
		},


		pad: function(num, width) {
			var n = '' + num;
			var w = n.length;
			var l = width;
			var pad = w < l ? l - w : 0;
			return n + Array(width + 1).join(" ").substr(0, pad);
		},

		table: function(which, useColog) {
			var colog = (!!useColog) ? require('colog') : null;
			var assets = (which.indexOf("assets") != -1);
			var list = !assets ? base.liabList() : base.assetsList();
			list.sort(function(a, b) {
				return new Date(a.date[0]) - new Date(b.date[0]);
			});
			list.forEach(function(element, index, array) {
				//console.log(JSON.stringify(element));
				var string = " " + base.pad(element.title[0], 20).toUpperCase();
				string += " - "
				string += base.pad(element.status[0], 7).toUpperCase();
				string += " - "
				string += base.pad("$" + parseFloat(element.amount[0]).toFixed(2), 8);
				string += " - "
				string += base.pad(element.date[0], 10);
				var total_owed = ( !! element.total_owed) ? parseFloat(element.total_owed[0]).toFixed(2) : null;
				if (total_owed && total_owed > 0) {
					string += " - "
					string += "OWED: $" + total_owed;
				}
				string = (!!colog) ? colog.apply(base.pad(string, 90), ["white", assets ? "bgGreen" : "bgRed"]) : string;
				string += "\n"
				if ( !! element.website) string += "  SITE: " + element.website[0];
				string += "\n"
				string += "  NOTE: "
				string += (element.note[0].length > 1) ? element.note[0] : "-";
				//string += "\n"

				if ("true" != element.hidden[0]) ((!!colog) ? colog : console).log(string);
			});
		},

		ready: function(filename, filepath, outputFormat, readyCallback) {
			var filename = !filename ? 'accounts.xml' : filename;
			var filepath = !filepath ? __dirname : filepath;

			var outputFormat = !!outputFormat ? outputFormat : "";
			base.outputFormat = outputFormat;

			var path = require('path');
			var inputXMLFilename = path.resolve(filepath, filename);
			var outputJSONFilename = path.resolve(filepath, "accounts.json");

			var callback = function(err, result) {
				if (err) console.log(err);
				base.accountsData = result;
				
				base.json = base.fixXMLResult(result);
				
				base.json.balance = [];
				
				base.json.balance.push({ title: "Total Assets", amount: base.total.assets() });
				base.json.balance.push({ title: "Total Liabilities", amount: base.total.liablities() });
				base.json.balance.push({ title: "Total Owed", amount: base.total.owed() });
				if (base.total.due() > 0) {
					base.json.balance.push({ title: "Total Due", amount: base.total.due() });
				}
				if (base.total.pending() > 0) {
					base.json.balance.push({ title: "Total Pending", amount: base.total.pending() });
				}
				base.json.balance.push({ title: "Balance", amount: base.getBalance() });
				var balMinPend = base.getBalance() - base.total.pending();
				if (base.total.pending() > 0) {
					base.json.balance.push({ title: "Balance - Pending", amount: balMinPend });
				}
				var balMinPendDue = base.getBalance() - base.total.pending() - base.total.due();
				if (base.total.due() > 0) {
					base.json.balance.push({ title: "Balance - Pend/Due", amount: balMinPendDue });
				}
				
				base.outputJSONfile(base.json, outputJSONFilename);
				
				if(base.outputFormat=="plain" || base.outputFormat =="colored" ){
					var useColog = base.outputFormat =="colored";
					
					//console.log(JSON.stringify(base.accountsData.accounts)); //.balance[0].item[0].amount[0]);
					//console.log(JSON.stringify(base.assetsList()));
					console.log("Total Assets       = " + base.total.assets());
					console.log("Total Liabilities  = " + base.total.liablities());
					console.log("Total Owed         = " + base.total.owed());
					console.log("Total Due          = " + base.total.due());
					console.log("Total Pending      = " + base.total.pending());
					console.log("Balance            = " + base.getBalance());
					console.log("Rental             = " + base.getRental());
					var balMinPend = parseFloat(base.getBalance() - base.total.pending()).toFixed(2)
					if (base.total.pending() > 0) {
						console.log("Balance - Pending  = " + balMinPend);
					}
					if (base.total.due() > 0) {
						console.log("Balance - Pend/Due = " + parseFloat(base.getBalance() - base.total.pending() - base.total.due()).toFixed(2));
					}
					console.log("------------------------------------------");
					console.log("LIABILITIES");
					base.table("liabilities",useColog);
					console.log("------------------------------------------");
					console.log("ASSETS");
					base.table("assets",useColog);
					//console.log(JSON.stringify(base.assetsList()));
					console.log("------------------------------------------");
					console.log("OTHER");
					console.log(base.links());
				}

				readyCallback(base);

			};
			base.parseXML(inputXMLFilename, callback);
		},

		fixXMLResult: function(object) {
			//http://stackoverflow.com/questions/122102/most-efficient-way-to-clone-an-object
			var newObject = JSON.parse(JSON.stringify(object));
			newObject = newObject.accounts;

			var sections = ["balance", "liabilities", "assets"];
			for (var s = 0; s < sections.length; s++) {
				newObject[sections[s]] = newObject[sections[s]][0].item;

				//http://stackoverflow.com/questions/7440001/iterate-over-object-keys-in-node-js
				for (var i = 0; i < newObject[sections[s]].length; i++) {
					Object.keys(newObject[sections[s]][i]).forEach(function(element, key, _array) {
						newObject[sections[s]][i][element] = newObject[sections[s]][i][element][0];
					});
				}
			}

			return newObject;
		},

		total: {
			owed: function() {
				return parseFloat(base.liabList().map(function(el) {
					return Number(el.total_owed[0])
				}).reduce(function(previousValue, currentValue, index, array) {
					return previousValue + currentValue;
				})).toFixed(2);
			},
			due: function() {
				return parseFloat(base.liabList().filter(function(el) {
					return el.status[0].toLowerCase().indexOf("due") != -1
				}).map(function(el) {
					return Number(el.amount[0])
				}).reduce(function(previousValue, currentValue, index, array) {
					return previousValue + currentValue;
				}, 0)).toFixed(2);
			},
			pending: function() {
				return parseFloat(base.liabList().filter(function(el) {
					return el.status[0].toLowerCase().indexOf("pending") != -1
				}).map(function(el) {
					return Number(el.amount[0])
				}).reduce(function(previousValue, currentValue, index, array) {
					return previousValue + currentValue;
				}, 0)).toFixed(2);
			},
			assets: function() {
				//console.log("----"+JSON.stringify(base));
				return parseFloat(base.assetsList().map(function(el) {
					return Number(el.amount[0])
				}).reduce(function(previousValue, currentValue, index, array) {
					return previousValue + currentValue;
				}, 0)).toFixed(2);
			},
			liablities: function() {
				return parseFloat(base.liabList().map(function(el) {
					return Number(el.amount[0])
				}).reduce(function(previousValue, currentValue, index, array) {
					return previousValue + currentValue;
				}, 0)).toFixed(2);
			},
		},

		/*
		$(document).ready(function (){
			if (base.devicePixelRatio == 1.5) {
			  alert("This is a high-density screen");
			} else if (base.devicePixelRatio == 0.75) {
			  alert("This is a low-density screen");
			} else {
				alert("base.devicePixelRatio="+base.devicePixelRatio);
			}
		});
	*/

		outputJSONfile: function(object, filename, filepath) {
			var fs = require('fs');

			var myData = !object ? {
				name: 'test',
				version: '1.0'
			} : object;

			filename = !filename ? 'test.json' : filename;
			filepath = !filepath ? __dirname : filepath;

			var outputFilename = require('path').resolve(filepath, filename);

			fs.writeFile(outputFilename, JSON.stringify(myData, null, 4), function(err) {
				if (err) {
					console.log(err);
				} else {
					//console.log("JSON saved to " + outputFilename);
				}
			});
		},

		parseXML: function(file, callback) {
			var parser = new this.xml2js.Parser();
			base.fs.readFile(file, function(err, data) {
				if (err) {
					callback(err);
				} else {
					parser.parseString(data, function(err, result) {
						if (err) return callback(err);
						callback(null, result);
					});
				}
			});
		},

		parseXml: function(xml) {
			base.liabilityList = $(xml).find("accounts").find("liabilities").find("item");
			base.assetsList = $(xml).find("accounts").find("assets").find("item");
			base.balanceList = $(xml).find("accounts").find("balance").find("item");
			base.hiddenList = "";

			// UPDATE AIRWATCH DUE

			base.liabilityList.each(function() {
				base.liabilityTotal += Number($(base).find("amount").text());
				base.totalOwed += Number($(base).find("total_owed").text());
				if ($(base).find("status").text().toLowerCase() == "due") {
					//console.log( Number($(base).find("amount").text()) );
					base.dueTotal += Number($(base).find("amount").text());
				}
				if ($(base).find("status").text().toLowerCase() == "pending") {
					//console.log( Number($(base).find("amount").text()) );
					base.pendingTotal += Number($(base).find("amount").text());
				}

			});

			base.assetsList.each(function() {
				base.assetsTotal += Number($(base).find("amount").text());
			});

			base.balanceList.each(function() {
				if ($(base).find("title").text().toLowerCase() == "now pending") {
					base.pendingTotal += Number($(base).find("amount").text());
				}
			});

			base.netTotal = Number(base.assetsTotal - base.liabilityTotal);
			console.log(base.netTotal);
			// set up html
			$("body").append('<table class="main"><tbody id="main_tbody"><tr><td id="container" class="noborder"></tr></tbody></table>');
			$("#container").append('<table class="inner_b tablesorter" id="balanceTable"><tbody id="balanceContain"></tbody></table><h4>Liabilities [ ' + base.liabilityTotal.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ] / <a class="blend" target="new" href = "https://spreadsheets.google.com/ccc?key=0ApidX2Ywo6QCdExHYnpYc0VyeGJaUWZXcnA1WE5VMEE">[ ' + base.totalOwed.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ]</a>' + '<a href="../history.htm?' + totalOwed.toFixed(2).toString() + '"> - history</a></h4>');
			$("#container").append('<table class="inner_l tablesorter" id="liabilityTable"><thead><tr><th>Name</th><th>Amount</th><th>Occurence</th><th>Due Date</th><th>Total Owed</th><th>Status Code</th><th>Date Full</th></tr></thead><tbody id="liabContain"></tbody></table><h4>Assets [ ' + base.assetsTotal.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ]</h4>');
			$("#container").append('<table class="inner_a tablesorter" id="assetsTable"><thead><tr><th>Name</th><th>Amount</th><th>Occurence</th><th>Due Date</th><th>Total Owed</th><th>Status Code</th><th>Date Full</th></tr></thead><tbody id="assetsContain"></tbody></table><br>');

			loadBalance();
			loadLiab();
			loadAssets();

			$("#liabilityTable").tablesorter({
				sortList: [
					[5, 0],
					[6, 0]
				]
			});

			$("thead").hide();
			$(".invisible").hide();

			$("#main_tbody").append('<tr><td class="noborder footer_cell"></td></tr>');
			//$(".footer_cell").append('<center><a class="blend" target="_blank" href="https://ec2.chimpjuice.com/">EC2 Cloud Instance</a></center>');
			$(".footer_cell").append('<center><a class="blend" target="_blank" href="http://moourl.com/evmad">Financial Sites</a></center>');
			$(".footer_cell").append('<center><a class="blend" target="_blank" href="http://crosshj.synology.me:314/cents/accounts/usaa/summary">Main Bank Account History</a></center>');
			$(".footer_cell").append('<center><a class="blend" target="_blank" href="http://www.evernote.com/shard/s24/sh/7b2420f9-21dc-43f2-83c0-16358fcb4087/b46c4dc66e8a93eabae81f9717b41a15">Dev Notes [Evernote]</a></center>');
			$(".footer_cell").append('<center>Status : <a class="blend" target="_blank" href="https://web.eecs.utk.edu/~hcross3/cgi-bin/cents/log.xml">LOGGED</a></center>');

			// clicking center triggers new base to open
			$('.footer_cell center').click(function() {
				base.open($(base).find('a')[0].href, '_blank');
			});
			// clicking a does nothing, but click event propagates to parent
			$('.footer_cell center a').click(function(e) {
				e.preventDefault();
			});
			// link hover state when center is hovered
			$('.footer_cell center').hover(function() {
					$(base).find('a').addClass('hovered');
				},
				function() {
					$(base).find('a').removeClass('hovered');
				});


			base.hideAccounts();
			base.addTotalFunc();
		},

		loadBalance: function() {
			// load balance to html
			//$("#balanceContain").append('<tr id="balanceHeader" class="separator"/>');

			$("#balanceContain").append('<tr id="netTotal" class="paid"><td id="netTitle" class="inner_noborder">Assets - Liabilities = Net</td></tr>');
			$("#netTotal").append('<td id="netValue" class="value" align="right">' + (base.assetsTotal - base.liabilityTotal).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>');

			$("#balanceContain").append('<tr id="due" class="due"><td id="dueTitle" class="inner_noborder">Now Due</td></tr>');
			$("#due").append('<td id="dueValue" class="value" align="right">' + base.dueTotal.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>');

			$("#balanceContain").append('<tr id="current" class="paid"><td id="currentTitle" class="inner_noborder"><a href="https://mobile.usaa.com/" target="_blank">Current Balance [ ' + balance_get.date + " " + balance_get.time + ' ]</a></td></tr>');
			$("#current").append('<td id="currentValue" class="value" align="right">' + base.balanceAmount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>');

			$("#balanceContain").append('<tr id="pending" class="pending"><td id="pendingTitle" class="inner_noborder"><a href="../edit_dialog.php?ac=Now Pending">Now Pending</a></td></tr>');
			$("#pending").append('<td id="pendingValue" class="value" align="right">' + base.pendingTotal.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>');

			$("#balanceContain").append('<tr id="adjusted" class="paid"><td id="adjustedTitle" class="inner_noborder">Adjusted Balance</td></tr>');
			$("#adjusted").append('<td id="adjustedValue" class="value" align="right">' + (base.balanceAmount - base.pendingTotal).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>');

			if (base.dueTotal != 0) {
				$("#balanceContain").append('<tr id="adjustedminusdue" class="due"><td id="adjustedminusdueTitle" class="inner_noborder">Adjusted - Due </td></tr>');
				$("#adjustedminusdue").append('<td id="adjustedValue" class="value" align="right">' + (base.balanceAmount - base.pendingTotal - base.dueTotal).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>');
			}

			//base.balanceList.each( function() {  $("#netValue").text($(base).find("amount").text()); } );

			//update force refresh
			$('tr[id=current]').children('.value').click(forceRefresh);
		},

		loadLiab: function() {
			base.liabilityList.each(function() {
				var status = $(base).find("status").text().toLowerCase();
				$("#liabContain").append('<tr class="' + status + '"><td class="title"><a href="../edit_dialog.php?ac=' + $(base).find("title").text() + '">' + $(base).find("title").text() + '</a></td></tr>');
				$("#liabContain td:last").after('<td align="right" class="amount">' + Number($(base).find("amount").text()).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>');
				$("#liabContain td:last").after('<td class="occurrence">' + $(base).find("occurence").text() + '</td>');
				$("#liabContain td:last").after('<td class="due_date">' + $(base).find("date").text().substring(5, 10).replace("-", "/") + '</td>');
				if (Number($(base).find("total_owed").text()) > 0)
					$("#liabContain td:last").after('<td align="right" class="total_owed">' + Number($(base).find("total_owed").text()).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>');
				else
					$("#liabContain td:last").after('<td width="120" class="total_owed"></td>');

				$("#liabContain td:last").after('<td class="invisible">' + ((status == "due") ? '1' : (status == "pending") ? '2' : '3') + '</td>');
				$("#liabContain td:last").after('<td class="invisible">' + $(base).find("date").text() + '</td>');

			});
		},

		loadAssets: function() {
			base.assetsList.each(function() {
				$("#assetsContain").append('<tr class="paid"><td class="title"><a href="../edit_dialog.php?ac=' + $(base).find("title").text() + '">' + $(base).find("title").text() + '</a></td></tr>');
				if (!($(base).find("title").text().toLowerCase() == "thorne circle")) {
					$("#assetsContain td:last").after('<td align="right" class="amount">' + Number($(base).find("amount").text()).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>');
				} else {
					$("#assetsContain td:last").after('<td align="right" class="amount">' + base.rentalAmount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>');
				}
				$("#assetsContain td:last").after('<td class="occurrence">' + $(base).find("occurence").text() + '</td>');
				$("#assetsContain td:last").after('<td class="due_date">' + $(base).find("date").text().substring(5, 10).replace("-", "/") + '</td>');
				if (Number($(base).find("total_owed").text()) > 0)
					$("#assetsContain td:last").after('<td align="right" class="total_owed">' + $(base).find("total_owed").text().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '</td>');
				else
					$("#assetsContain td:last").after('<td width="120" class="total_owed"></td>');
			});
		},

		getRental: function() {
			var amount = "[TODO]";

			//console.log('TODO: ajax call here');
			/*
					$.ajax({
						type: "GET",
						cache: false,
						url: "https://web.eecs.utk.edu/~hcross3/cgi-bin/cents/rental/index.cgi",
						async: false,
						dataType: "xml",
						success: function(xml) {
							amount += Number($(xml).find("result").text());
						}

					});
				*/

			return amount;
		},

		getBalance: function() {
			//console.log(JSON.stringify(base.balanceList()))
			var amount = base.balanceList()[0].amount[0];
			//console.log('TODO: ajax call here');
			/*
						$.ajax({
							type: "GET",
							cache: false,
							url: "https://web.eecs.utk.edu/~hcross3/cgi-bin/cents/update_bal/update_bal_amzn.cgi",
							async: false,
							dataType: "json",
							success: function(jsondata) {
								console.log("GOT_AMOUNT= " +jsondata.balance );
								amount += Number(jsondata.balance);
								balance_get=jsondata;
							}
						});
					*/
			return parseFloat(amount).toFixed(2);
		},

		getUrlVars: function() {
			// get url vars, ie, http://www,base,com/index,html?base=that then  var base = getUrlVars()["base"];

			var vars = {};
			var parts = base.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
				vars[key] = value;
			});
			return vars;
		},

		getUrlVars2: function() {
			// Read a page's GET URL variables and return them as an associative array.

			var vars = [],
				hash;
			var hashes = base.location.href.slice(base.location.href.indexOf('?') + 1).split('&');

			for (var i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				vars.push(hash[0]);
				vars[hash[0]] = hash[1];
			}

			return vars;
		},

		forceRefresh: function() {
			var amount = Number(0);
			$('tr[id=current]').children('.value').css("padding-right", "20px");
			$('tr[id=current]').children('.value').html('<img src="ajax-loader.gif"/>')
			$.ajax({
				type: "GET",
				cache: false,
				url: "https://web.eecs.utk.edu/~hcross3/cgi-bin/cents/update_bal/update_bal3.cgi",
				async: true,
				dataType: "xml",
				success: function(xml) {
					console.log("GOT_AMOUNT= " + Number($(xml).find("balance").text()));
					amount += Number($(xml).find("balance").text());
					$('tr[id=current]').children('.value').text(amount);
					$('tr[id=current]').children('.value').css("padding-right", "");
				}
			});

		},

		hideAccounts: function() {
			base.hiddenList = [];
			base.liabilityList.each(function() {
				if ($(base).find('hidden').text() == "true" && $(base).find('status').text().toLowerCase() == "paid") {
					var itemName = $(base).find('title').text();
					$('.title a').each(function() {
						if ($(base).text() == itemName) {
							base.hiddenList.push($(base).closest('tr'));
							$(base).closest('tr').hide();
						}
					})
				}
			})
			if ($(base.hiddenList).size() > 0) {
				var showHiddenLink = $('.noborder.footer_cell').find('center').last().clone().html('<a class="blend">Show Hidden</a>');
				showHiddenLink.find('a').click(function() {
					showHidden($(base).closest('center'));
				});
				$('.noborder.footer_cell').append(showHiddenLink);
			}
		},

		showHidden: function(clickItem) {
			$('.title a').closest('tr').show();
			clickItem.html('<a class="blend">Hide Hidden</a>')
			clickItem.find('a').click(function() {
				$(base).closest('center').remove();
				hideAccounts();
			});
			console.log(clickItem.html());
		},

		doTotal: function() {
			// get total of all checked

			base.checkedTotal = 0;
			$('td.checkbox input:checked').closest('tr').find('td.amount').each(function() {
				checkedTotal += parseFloat($(base).text().replace(",", ""));
			})
			$('div.total div:eq(1)').text("$" + checkedTotal.numberFormat(2));
		},

		addTotalFunc: function() {
			Number.prototype.numberFormat = function(decimals, dec_point, thousands_sep) {
				dec_point = typeof dec_point !== 'undefined' ? dec_point : '.';
				thousands_sep = typeof thousands_sep !== 'undefined' ? thousands_sep : ',';

				var parts = base.toFixed(decimals).toString().split(dec_point);
				parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_sep);

				return parts.join(dec_point);
			}

			$('h4:contains("Liabilities")').css("display", "inline-block");
			$('#liabContain tr td:first-child').before('<td class="checkbox"></td>');

			$('td.checkbox').html('<input type="checkbox" name="checkbox" value="value" />');

			$('h4:contains("Liabilities")').after('<div class="total"><div></div><div></div></div>');

			$('td.checkbox').click(function(e) {
				var checkB = $(base).find('input');
				if (!checkB.is(':checked')) {
					$(base).closest('tr').removeClass('selected');
				} else {
					$(base).closest('tr').addClass('selected');
				}
				doTotal();
				e.stopPropagation();
			});

			$('#liabilityTable a').click(function(e) {
				e.stopPropagation();
			});

			$('#liabilityTable tr').click(function() {
				var checkB = $(base).find('.checkBox input');
				if (checkB.is(':checked')) {
					checkB.attr('checked', false);
					$(base).removeClass('selected');
				} else {
					checkB.attr('checked', true);
					$(base).addClass('selected');
				}
				doTotal();
				$('div.total').css("opacity", "1");
			});

			$('div.total').click(function() {
				$(base).css("opacity", "1");
				$('div.total div:eq(0)').text("Total : ");
				$('div.total div:eq(1)').text(" $0.00");
				$('td.checkbox').css("opacity", "1");
				doTotal();
			});
		}
	}.base();

	var base = module.exports.base;

})();