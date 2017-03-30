/*
eslint-disable no-console
*/

var cron = require('cron');
const exec = require('child_process').exec;
var timestamp = require('./utilities/date').stamp;

const DEBUG = true;

const randomNumberBetween = (start, end) => {
  return Math.floor(Math.random() * end) + start;
};

const randomDelay = fn => {
  return () => {
    const delay = randomNumberBetween(0, 45);
    if (DEBUG) {
      console.log(timestamp(), ' CRON: will execute scrape with delay: ', delay, ' minutes');
    }
    fn(delay);
  };
};

// TODO: should not run if it doesn't make sense to
const runScrape = (sleepMinutes) => {
  const command = "sleep " + (sleepMinutes * 60) +
    " && xvfb-run --auto-servernum --server-args='-screen 0 801x601x24' node " +
    require('path').join(__dirname, 'scrape.js');
  var child = exec(command);
  child.stdout.on('data', (...args) => !/^\s*$/.test(args.join('').trim()) && console.log(...args)); //don't log if blank line
  child.stderr.on('data', console.error);
  // child.on('close', function(code) {
  //     console.log('closing code: ' + code);
  // });
};

var job = new cron.CronJob({
  cronTime: '0 0 0-1,6-23 * * *',
  onTick: randomDelay(runScrape),
  start: false,
  timeZone: "America/New_York"
});

module.exports = () => {
  if(!job.running){
    job.start();
  }
};
