window.require = function(name, moduleName) {
	_require = require;

	if(!moduleName) {
		moduleName = name;
	}

	console.log('Fetching ' + moduleName + '... just one second');
	var url = 'http://wzrd.in/bundle/' + moduleName + '@latest/';
	if(moduleName && moduleName.includes('/')){
		url = moduleName;
	}
	fetch(url)
		.then(function(res) {
			require = null;
			res.text().then(text => {
				eval(text);
				window[name] = require(moduleName);
				require = _require;
				console.log('Finished getting ' + moduleName);
			});
	})
	.catch(function(err) {
		console.log('Fetch Error : ', err);
	});
};
