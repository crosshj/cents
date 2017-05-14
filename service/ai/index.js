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
const scraped = clone(trainingSet);
//const testSet = set.test;
//console.log(trainingSet)
const synaptic = require('synaptic');
const Layer = synaptic.Layer;
const Network = synaptic.Network;
const Trainer = synaptic.Trainer;

const inputLayer = new Layer(9);
const hiddenLayer = new Layer(8);
const outputLayer = new Layer(1);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

const myNetwork = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
});

const trainer = new Trainer(myNetwork);
const trainingOptionsA = {
  rate: .1,
  error: .000001,
  shuffle: true,
  log: 1
};
// const trainingOptionsB = {
//     rate: .2,
//     iterations: 20,
//     error: .1,
//     shuffle: true,
//     log: 1,
//     cost: Trainer.cost.CROSS_ENTROPY
// };
trainer.train(trainingSet, trainingOptionsA);

// does network predict inputs? should be true for all cases
// trainingSet.forEach(item =>
//   console.log(Math.round(myNetwork.activate(item.input)[0]) === item.output[0])
// );

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
