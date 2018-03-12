/*
eslint-disable no-console
*/

var db = require('./index');
var async = require('async');


const defaultCallback = (operation, callback) => {
  return (err, result) => {
    if (err){
      return console.log('ERROR - default DB ' + operation.toUpperCase() + ' callback:\n', JSON.stringify(err, null, ' '));
    }
    console.log('SUCCESS - default DB ' + operation.toUpperCase() + ' callback');
    result && console.log('Result:\n', JSON.stringify(result, null, ' '));
    callback();
  };
};

const init = callback => {
  db.init({
    callback: defaultCallback('init', callback)
  });
};

const create = callback => {
  const docs = [
    {hello:'world-1'},
    {hello:'world-2'}
  ];
  db.create({
    docs,
    callback: defaultCallback('create', callback)
  });
};

const read = callback => {
  const query = {hello:'world-2'};
  db.read({
    query,
    callback: defaultCallback('read', callback)
  });
};

const update = callback => {
  const query = {hello:'world-2'};
  const update = {update: 'new field'};
  db.update({
    query, update,
    callback: defaultCallback('update', callback)
  });
};

const del = callback => {
  const query = {hello: /world/};
  db.del({
    query,
    callback: defaultCallback('delete', callback)
  });
};

async.series([init, create, read, update, del]);
