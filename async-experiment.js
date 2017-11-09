var async = require('async');

function getLevelOne(data, callback){
    callback(null, [1, 2, 3, 4, 5]);
}

function getLevelTwoItem(item, callback){
    console.log('---- L2 item', item);
    setTimeout(function(){
        callback(null, new Array(2*item||1).fill().map((x,i)=>i));
    }, item*100)
}

function getLevelThreeItem(item, callback){
    //console.log('---- L3 item', item);
    setTimeout(function(){
        callback(null, new Array(2*item||1).fill().map((x,i)=>2*i));
    }, item*500)
}

var fnArray = [
    getLevelOne,
    getLevelTwoItem,
    getLevelThreeItem
];

var concurrency = 2;

// -------------------------------------------------------------------

var q = async.queue(function (task, callback) {
    console.log('task name: ', task.name);
    console.log('task data: ', task.data)
    task.fn(callback);
}, concurrency);

// assign a callback
q.drain = function() {
    console.log('all items have been processed');
}

function eachOfItem(fnList, index, data, callback){
    fnList[index](data, function(err, items){
        console.log(`---- ${fnList[index+1].name} items`, items);
        var nextfn = index+2 === fnList.length
            ? function(cb){
                var item = this.item;
                fnList[index+1]({item}, callback);
              }
            : function(cb){
                var item = this.item;
                return eachOfItem(fnList, index+1, { item }, cb);
              };
        items.forEach(item => {
            q.push({
                name: fnList[index+1].name,
                fn: nextfn.bind({ item }),
                data: { item }
            });
        });
        callback();
    });
}

q.push({
    name: fnArray[0].name,
    fn: callback => eachOfItem(fnArray, 0, undefined, callback),
    data: { items: [1, 2, 3, 4, 5]}
});










// function eachL3Item(cb3){
//     getLevelThreeItem(function(errL3, itemsL3){
//         itemsL3.forEach(itemL3 => q.push({
//             name: "lastStep",
//             fn: function(callback){
//                 var item = this.item;
//                 console.log('Result: ', item);
//                 callback();
//             },
//             data: { item: itemL3 }
//         }));
//     });
//     cb3();
// }

// function eachL2Item(cb2){
//     getLevelTwoItem(function(errL2, itemsL2){
//         itemsL2.forEach(itemL2 => q.push({
//             name: getLevelThreeItem.name,
//             fn: eachL3Item,
//             data: { item: itemL2 }
//         }));
//         cb2();
//     })
// }

// function eachL1Item(callback){
//     getLevelOne(function(err, items){
//         items.forEach(item => q.push({
//             name: getLevelTwoItem.name,
//             fn: eachL2Item,
//             data: { item }
//         }));
//         cb1();
//     })
// }
// -----------------------------------------