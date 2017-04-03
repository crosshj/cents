/*
 - TODO: should scrape or not scrape

  https://github.com/cazala/synaptic

  https://blog.webkid.io/neural-networks-in-javascript/

  also see:
  https://github.com/dn2a/dn2a-javascript
  https://stevenmiller888.github.io/mind-how-to-build-a-neural-network/ - general NN stuff
  http://stackabuse.com/neural-networks-in-javascript-with-brain-js/

*/


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

const myNetwork = new Architect.Perceptron(9,5,1);

//const myNetwork = new Architect.Perceptron(9,5,5,1);

// var input = 9;
// var pool = 20;
// var output = 1;
// var connections = 30;
// var gates = 10;
// const myNetwork = new Architect.Liquid(input, pool, output, connections, gates);

const trainer = new Trainer(myNetwork);
const trainingOptionsA = {
  rate: .1,
  error: .00001,
  shuffle: true,
  log: 1
};
trainer.train(trainingSet, trainingOptionsA);


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
  if (input[4] > 1){
    input[4] -= 1;
    input[3] += 1/24;
    input[7] += 1/(5*24*60);
    input[9] += 1/(5*24*60);
  }
  // hours overflow
  if (input[3] > 1){
    input[3] -= 1;
    input[2] += 1/31;
  }
  // days overflow
  if (input[2] > 1){
    input[2] -= 1;
    input[1] += 1/12;
  }
  // months overflow
  if (input[1] > 1){
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
