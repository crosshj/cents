/* eslint-disable no-console */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const revert = require('./revert');
const scrapePath = path.join(__dirname, '../../logs/scrape.log');
const readLastLines = require('read-last-lines');

const rl = readline.createInterface({
  input: fs.createReadStream(scrapePath)
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
    parseFloat(Number(!line.includes('already'))),
    (diffMins / (5*24*60)) || 0,
    parseFloat(Number(!previous.includes('already'))),
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
    normArray.push({
      input: normalized.filter((item,index)=> index !== 6),
      output: [normalized[6]]
    });
    //console.log(normalized.map(x=>Number(x).toFixed(4)).join(', '));
  }
  previous = line;
});

rl.on('close', () => {
  fs.writeFile(
    path.join(__dirname, '../../logs/scrape.log.converted.json'),
    JSON.stringify(normArray, null, '  '),
    function(err) {
      if(err) {
          return console.log(err);
      }

      var converted = require(path.join(__dirname, '../../logs/scrape.log.converted.json'));
      // console.log(
      //   JSON.stringify(
      //     converted,
      //     null,
      //     '  '
      //   )
      // );
      readLastLines.read(scrapePath, 1).then((lines) => {
        console.log('Last line of log: ', lines.replace(/\n/g, ''));
        console.log('Last converted:   ', revert(converted[converted.length-1].input));
      });
  });
});
