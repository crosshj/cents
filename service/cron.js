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
    const delay = randomNumberBetween(0, 59);
    if (DEBUG) {
      console.log(timestamp(), ' CRON: will execute scrape with delay: ', delay, ' minutes');
    }
    setTimeout(() => {
      if (DEBUG) {
        console.log(timestamp(), ' CRON: exexuting scrape');
      }
      fn();
    }, delay * 60000);
  };
};

// TODO: should not run if it doesn't make sense to
const runScrape = () => {
  const command = "xvfb-run --auto-servernum --server-args='-screen 0 801x601x24' node " + require('path').join(__dirname, 'scrape.js');
  exec(command);
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
