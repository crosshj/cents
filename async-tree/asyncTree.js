var async = require('async');

function asyncTree({
  functionArray = [],
  concurrency = 1,
  delay = 0,
  eachCallback = ()=>{},
  doneCallback = ()=>{}
}){
  var q = async.priorityQueue(function (task, callback) { 
      //NOTE: very dumb delay!!
      setTimeout(function(){
          task.fn.bind(task.data)(callback);
      }, task.delay || delay);
  }, concurrency);

  function finalResults(callback){
      eachCallback(undefined, this.results);
      callback();
  }
  functionArray.push(finalResults);

  q.drain = doneCallback;

  function eachOfItem(fnList, index, callback){
      var parent = this;

      function currentCallback(err, items){
          var nextfn = index+2 === fnList.length
              ? function(cb){
                  fnList[index+1].bind(this)(cb);
              }
              : function(cb){
                  return eachOfItem.bind(this)(fnList, index+1, cb);
              };
          // maybe batch items here
          items.forEach(item => {
              var task = {
                  fn: nextfn,
                  data: { item }
              };
              if(!parent.results){
                  task.data.results = [item];
              } else {
                  task.data.results = parent.results.concat(item);
              }
              q.push(task, fnList.length-index);
          });
          callback();
      }

      fnList[index].bind(this)(currentCallback);
  }

  q.push({
      fn: function(callback){ eachOfItem.bind(this)(functionArray, 0, callback); },
      data: { delay: 0 }
  });
}

module.exports = asyncTree;