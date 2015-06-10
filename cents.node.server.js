/*

SIMPLE NODE SERVER - http://stackoverflow.com/questions/6084360/using-node-js-as-a-simple-web-server
NODE ON PI AT STARTUP WITH FOREVER (CRONTAB) - http://www.linuxcircle.com/2013/12/30/run-nodejs-server-on-boot-with-forever-on-raspberry-pi/
RELATIVE URL TO ANOTHER PORT - http://stackoverflow.com/questions/6016120/relative-url-to-a-different-port-number-in-a-hyperlink
NGINX ON PI (CONFIGURE DEFAULTS) - http://www.ducky-pond.com/posts/2013/Sep/setup-a-web-server-on-rpi/

TODO:

*/

var http = require('http');
var c = require('./centslib.node');
var port = 8080;

http.createServer(function (req, res) {
	if (req.method == 'POST') {
		var body = '';
        	req.on('data', function (data) {
            		body += data;
        	});
        	req.on('end', function () {
            		var data = JSON.parse(body);
            		c.saveAccounts(data);
        	});
       		res.writeHead(200, {'Content-Type': 'text/html'});
        	res.end('post received');
	} else {
		var jsonFile = c.getAccounts();
		
		var index = c.htmlFromJson(jsonFile);
		index = (index||"").replace("{{MAIN_DATA}}",JSON.stringify(jsonFile));

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(index);
	}
}).listen(port);
