var scrape = require('./scrape');
var cron = require('cron');

const randomNumberBetween = (start, end) => {
  return Math.floor(Math.random() * end) + start;
};

const randomDelay = fn => {
  return () => {
    const delay = randomNumberBetween(0, 59) * 1000;
    setTimeout(fn, delay);
  }
};


var job = new cron.CronJob({
  cronTime: '* 0-1,6-23 * * * *',
  onTick: randomDelay(scrape),
  start: false
});


module.exports = () => {
  if(!job.running){
    job.start();
  }
};
