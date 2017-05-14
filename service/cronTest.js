/*
eslint-disable no-console
*/
var cron = require('cron');
const exec = require('child_process').exec;

var already = false;
const runScrape = () => {
  if (already) return;
  already = true;
  const command = "xvfb-run --auto-servernum --server-args='-screen 0 801x601x24' node " + require('path').join(__dirname, 'scrape.js');
  console.log(command);
  exec(command);
};

var job = new cron.CronJob({
  cronTime: '* * * * * *',
  onTick: runScrape,
  start: false
});

if(!job.running){
  job.start();
}
