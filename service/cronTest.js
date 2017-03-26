var cron = require('cron');
const exec = require('child_process').exec;

const randomNumberBetween = (start, end) => {
  return Math.floor(Math.random() * end) + start;
};

var already = false;
const runScrape = () => {
  if (already) return;
  already = true;
  const command = "xvfb-run --server-args='-screen 0 801x601x24' node " + require('path').join(__dirname, 'scrape.js');
  console.log(command);
  exec(command);
}

var job = new cron.CronJob({
  cronTime: '* * * * * *',
  onTick: runScrape,
  start: false
});

if(!job.running){
  job.start();
}
