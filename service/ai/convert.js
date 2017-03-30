/* eslint-disable no-console */

const readline = require('readline');
const fs = require('fs');
const path = require('path');


const rl = readline.createInterface({
  input: fs.createReadStream(
    path.join(__dirname, '../../logs/scrape.log')
  ),
  output: fs.createWriteStream(
    path.join(__dirname, '../../logs/scrape.log.converted'),
    {'flags': 'w+'}
  )
});

var lastGot = '';
function convert(line, previous){
  const year = line.substr(2,2);
  const month = line.substr(4,2);
  const day = line.substr(6,2);
  const hour = line.substr(9,2);
  const minutes = line.substr(12,2);
  const seconds = line.substr(15,2);

  const scrapeTimeString = [
    line.substr(0,4),
    line.substr(4,2),
    line.substr(6,2)
  ].join('-')+' '+line.substr(9,8);
  const scrapeTime = new Date(scrapeTimeString);

  const prevTimeString = [
    previous.substr(0,4),
    previous.substr(4,2),
    previous.substr(6,2)
  ].join('-')+' '+previous.substr(9,8);
  const prevTime = new Date(prevTimeString);

  const diffMins = (scrapeTime-prevTime)/60000;
  const lastGoodMins = lastGot
    ? (scrapeTime-lastGot)/60000
    : 0;
  var normLine = [
    year/100,
    month/12,
    day/31,
    hour/24,
    minutes/60,
    seconds/60,
    line.includes('already'),
    (diffMins / (5*24*60)) || 0,
    previous.includes('already'),
    lastGoodMins / (5*24*60)
  ];

  if(!line.includes('already')){
    lastGot = scrapeTime;
  }

  return normLine
    .map(x=>Number(x));
}


var previous = '';
var normArray = [];
rl.on('line', function (line) {
  if (!line || line.includes('bad scrape')){
    return;
  }

  var normalized = convert(line, previous);
  if (normalized[normalized.length-1]){
    normArray.push(normalized);
    //console.log(normalized.map(x=>Number(x).toFixed(4)).join(', '));
  }
  previous = line;
});

rl.on('close', () => {
  fs.writeFile(
    path.join(__dirname, '../../logs/scrape.log.converted'),
    JSON.stringify(normArray),
    function(err) {
      if(err) {
          return console.log(err);
      }

      console.log(normArray.map(x =>
        x.map(x=>Number(x).toFixed(4)).join(', ')
      ).join('\n'));
  });
});
