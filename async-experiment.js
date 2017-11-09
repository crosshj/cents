var async = require('async');

function getLevelOne(callback){
    callback(null, this.items);
}

function getLevelTwoItem(callback){
    var item = this.item;
    //console.log('---- L2 item', item);
    const results = new Array(item).fill().map(x => item);
    //results.parent = this.parent;
    setTimeout(function(){
        callback(null, results);
    }, [1, 2000, 200, 5000, 300][item]);
}

function getLevelThreeItem(callback){
    var item = this.item;
    //console.log('---- L3 item', item);
    setTimeout(function(){
        const results = new Array(item).fill().map(x => item);
        //results.parent = this.parent;
        callback(null, results);
    }, [300, 1, 50, 1000, 30, 300, 1, 50, 1000, 30][item]);
}

var finalResultsArray = [];
function finalResults(callback){
    const {getLevelOne, getLevelTwoItem, item} = this;
    const results = {
        levelOneItem: getLevelOne,
        levelTwoItem: getLevelTwoItem,
        levelThreeItem: item
    };
    //console.log('--------', JSON.stringify(results));
    finalResultsArray.push(results);
    callback();
}

var fnArray = [
    getLevelOne,
    getLevelTwoItem,
    getLevelThreeItem,
    finalResults
];

var concurrency = 2;

// -------------------------------------------------------------------

var q = async.queue(function (task, callback) {
    //console.log('task name: ', task.name);
    //console.log('task data: ', task.data);
    task.fn.bind(task.data)(callback);
}, concurrency);

q.drain = function() {
    console.log('all items have been processed');
    console.log(finalResultsArray.length);
};

function eachOfItem(fnList, index, callback){
    var parent = this;
    fnList[index].bind(this)(function(err, items){
        //console.log(`---- ${fnList[index+1].name} items`, items);
        var nextfn = index+2 === fnList.length
            ? function(cb){
                fnList[index+1].bind(this)(cb);
              }
            : function(cb){
                return eachOfItem.bind(this)(fnList, index+1, cb);
              };
        items.forEach(item => {
            var task = {
                name: fnList[index+1].name,
                fn: nextfn,
                data: { item }
            };
            (parent.item === 0 || parent.item) && (task.data[fnList[index-1].name] = parent.item);
            index > 0 && (task.data = Object.assign({}, parent, task.data));
            q.push(task);
        });
        callback();
    });
}

q.push({
    name: fnArray[0].name,
    fn: function(callback){ eachOfItem.bind(this)(fnArray, 0, callback); },
    data: { items: [1, 2, 3, 4, 5] }
});
