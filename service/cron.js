var cron = require('cron');
const exec = require('child_process').exec;

const randomNumberBetween = (start, end) => {
  return Math.floor(Math.random() * end) + start;
};

const randomDelay = fn => {
  return () => {
    const delay = randomNumberBetween(0, 59) * 1000;
    setTimeout(fn, delay);
  }
};

// TODO: should not run if it doesn't make sense to
const runScrape = () => {
  const command = "xvfb-run --server-args='-screen 0 801x601x24' node " + require('path').join(__dirname, 'scrape.js');
  exec(command);
}

var job = new cron.CronJob({
  cronTime: '0 0-1,6-23 * * * *',
  onTick: randomDelay(runScrape),
  start: false
});

module.exports = () => {
  if(!job.running){
    job.start();
  }
};
