const newman = require('newman');

// call newman.run to pass `options` object and wait for callback
newman.run({
  //https://github.com/postmanlabs/newman#newmanrunoptions-object--callback-function--run-eventemitter
  collection: require('./test-collection.json'),
  insecure: true,
  ignoreRedirects: false,
  reporters: 'cli',
  reporter: {
    silent: true
  }
})
  .on('start', function (err, args) {
    if (err) { return; }

    //console.info(`Running ${args.cursor.length} request(s) and ${args.cursor.cycles} iteration(s)`);
  })
  .on('request', function (err, args) {
    var url = args.request.url.toString();
    console.log(url);

  })
  .once('done', function (err) {
    // var urls = Object.keys(uniqueUrls); // get list of all unique urls as an array from the object hash

    // now output the result to console
//console.info(`The collection run completed ${err ? 'with' : 'without'} error(s).`);
    //console.info(`Total ${urls.length} unique URLs requested.`);

    // urls.forEach(function (url) {
    //     console.info(`${uniqueUrls[url]}: ${url}`);
    // });
    console.log('----- done');
  });