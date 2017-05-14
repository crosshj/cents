/*
  eslint-disable no-console
*/
const path = require('path');
const revert = require('./revert');
const trainingSet = require(path.join(__dirname, '../../logs/scrape.log.converted.json'));

const synaptic = require('synaptic');
const Architect = synaptic.Architect;
const Trainer = synaptic.Trainer;

const scraped = clone(trainingSet);

const myNetwork = new Architect.Perceptron(5,16,1);

const trainer = new Trainer(myNetwork);
const trainingOptionsA = {
  rate: .1,
  iterations: 1000000,
  error: .07,
  shuffle: false,
  log: 1
};
trainer.train(narrow(clone(trainingSet)), trainingOptionsA);
// const trainingOpsB = (()=>{
//   var ops = clone(trainingOptionsA);
//   ops.shuffle=true;
//   ops.error = .07;
//   return ops;
// })();
// trainer.train(narrow(clone(trainingSet)), trainingOpsB);
/*
{
  "input": [
0    0.17, //year
1    0.25, //month
2    0.8709677419354839, //day
3    0.9166666666666666, //hour
4    0.23333333333333334, //mins
5    0.3333333333333333,  //secs
6    0.00430787037037037, //mins since last
7    0, //last status
8    0.015141203703703704 //mins since last good
  ],
  "output": [
    0
  ]
}

*/
function narrow(set){
  return set.map(x => ({
    output: x.output,
    input: x.input.filter((input, i) => [2,3,6,7,8].includes(i))
  }));
}

function clone(item){
  return JSON.parse(JSON.stringify(item));
}

function getPrediction(input){
  return Math.round(myNetwork.activate(input)[0]);
}

function advance(next){
  var input = clone(next);
  // input[5] += 1/60;
  // // seconds overflow
  // if (input[5] > 1){
  //   input[5] -= 1;
  //   input[4] += 1/60;
  // }
  input[4] += 1/60;
  // minutes overflow
  if (input[4] >= 1){
    input[4] -= 1;
    input[3] += 1/24;
    input[7] += 1/(5*24*60);
    input[9] += 1/(5*24*60);
  }
  // hours overflow
  if (input[3] >= 1){
    input[3] -= 1;
    input[2] += 1/31;
  }
  // days overflow
  if (input[2] >= 1){
    input[2] -= 1;
    input[1] += 1/12;
  }
  // months overflow
  if (input[1] >= 1){
    input[1] -= 1;
    input[0] += 1/100;
  }
  return input;
}

var next = advance(scraped[scraped.length-1].input);
var nextGetNew = undefined;
while (!nextGetNew){
  var prediction = getPrediction(next);
  if (prediction){
    nextGetNew = next;
  } else {
    next = advance(next);
  }
}

try {
  console.log('Last Scraped : ', revert(scraped[scraped.length-1].input) );
  console.log('Predict next : ', revert(nextGetNew).replace(/(got new|already had)/,'').trim());
} catch (error){
  console.log(error);
}


//console.log(myNetwork.toJSON())
