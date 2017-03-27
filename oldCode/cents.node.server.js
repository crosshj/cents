/*
eslint-disable no-console
*/

/*

SIMPLE NODE SERVER - http://stackoverflow.com/questions/6084360/using-node-js-as-a-simple-web-server
NODE ON PI AT STARTUP WITH FOREVER (CRONTAB) - http://www.linuxcircle.com/2013/12/30/run-nodejs-server-on-boot-with-forever-on-raspberry-pi/
RELATIVE URL TO ANOTHER PORT - http://stackoverflow.com/questions/6016120/relative-url-to-a-different-port-number-in-a-hyperlink
NGINX ON PI (CONFIGURE DEFAULTS) - http://www.ducky-pond.com/posts/2013/Sep/setup-a-web-server-on-rpi/
GZIP - http://canvace.com/tutorials/http-compression.html
BROWSER CACHE NGINX - https://www.digitalocean.com/community/questions/leverage-browser-caching-for-nginx
	- http://stackoverflow.com/questions/12640014/enable-gzip-for-css-and-js-files-on-nginx-server-for-magento
BROWSER CACHE NODE - TODO

TODO:

*/

var http = require('http');
var c = require('./centslib.node');
var httpProxy = require('http-proxy');
var zlib = require('zlib');
var fs = require('fs');

var postAccounts = require('./lib/postAccounts');

var options = {};
var proxy = httpProxy.createProxyServer(options);
var PROXY_PORT = 81;

var port = process.argv[2] || 8080;


function oldServer(){

	var readScriptStdOut = function(script, callback){
		var exec = require('child_process').exec;
		exec(script, function (error, stdout /*, stderr*/){
				// result
				if (error) return callback(error);
				callback(null, stdout);
		});
	}

	var mainHTML = function(req, res){
		var jsonFile = c.getAccounts();

		var index = c.htmlFromJson(jsonFile);
		index = (index||"")
		.replace("{{MAIN_DATA}}", JSON.stringify(jsonFile))
		.replace("{{DIR_NAME}}", __dirname);

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(index);
	};

	var getJSON = function(req, res){
		// not gzipped, using centslib
		//var jsonFile = c.getAccounts();
		//res.writeHead(200, {'Content-Type': 'application/json'});
		//res.end(JSON.stringify(jsonFile));

		// gzipped, using stream
		var raw = fs.createReadStream(__dirname + '/../accounts.json');
			res.writeHead(200, {
				'content-encoding': 'gzip',
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			});
			raw.pipe( zlib.createGzip() ).pipe(res);
	};

	var router = function(req, res){
		console.log("[REQUEST] " + req.url);

		if (req.url === '/favicon.ico') {
			res.writeHead(200, {'Content-Type': 'image/x-icon'} );
			res.end();
			return;
		}

		switch(true){
			//case /responsive$/.test(req.url):
			//	res.writeHead(302, { 'Location': 'responsive/' });
			//	res.end();
			//	break;
			// case /^\/responsive\/.*$/.test(req.url):
			// 	console.log("--call to proxy for static file");
			// 	req.url = req.url.replace(/\/responsive$/,"/responsive/");
			// 	proxy.web(req, res, { target: 'http://127.0.0.1:' + PROXY_PORT });
			// 	break;
			case (req.method == 'POST'):
				proxy.web(req, res, { target: 'http://127.0.0.1:' + PROXY_PORT });
				break;
			case ( /\/json$/.test(req.url) ):
				getJSON(req, res);
				break;
			// case /^\/static(\/.*$|$)/.test(req.url):
			// 	console.log("--call to proxy for static file");
			// 	req.url = req.url.replace(/^\/static(\/|$)/,"/");
			// 	proxy.web(req, res, { target: 'http://127.0.0.1:' + PROXY_PORT });
			// 	break;
			// case (/(index.css|manifest.json|\/.*\.png|\/.*\.jpg)$/).test(req.url):
			// 	fs.createReadStream(__dirname + '/' + req.url.replace(/^.*\//g,'')).pipe(res);
			// 	break;
			default:
				proxy.web(req, res, { target: 'http://127.0.0.1:' + PROXY_PORT });
				//mainHTML(req, res);
				//getJSON(req, res);
				break;
		}
	};

	http.createServer( function(req, res){
		router(req, res);
	}).listen(port);

	console.log("---- nodeCents server running on http://localhost:"+port);
}

module.exports = oldServer;
