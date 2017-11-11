var asyncTree= require('./asyncTree');

function getLevelOne(callback){
    var initialArgs = [0, 1, 2, 3, 4];
    callback(null, initialArgs);
}

function getLevelTwoItem(callback){
    var item = this.item;

    const results = new Array(item||1).fill().map(x => 2*item);
    setTimeout(function(){
        callback(null, results);
    }, [0, 2000, 2000, 3000, 1, 1][item]);
}

function getLevelThreeItem(callback){
    var item = this.item;
    console.log('---- ',this.results);
    setTimeout(function(){
        const results = new Array(item/2||1).fill().map(x => 2*item);
        callback(null, results);
    }, Math.floor(Math.random() * 3000));
}

var finalResultsArray = [];
function doneCallback(){
    console.log(`finished with ${finalResultsArray.length} results`);
}

function eachCallback(err, result){
    finalResultsArray.push(this.results);    
    console.log(result);
}

var functionArray = [
    getLevelOne,
    getLevelTwoItem,
    getLevelThreeItem
];

asyncTree({
    functionArray,
    concurrency: 2,
    delay: 100, //in ms
    doneCallback,
    eachCallback
});


