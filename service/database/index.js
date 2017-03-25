var Db = require('tingodb')().Db;
var path = require('path');

var db;
var collection;

const defaultCallback = operation => {
  return (err, result) => {
    if (err){
      return console.log('ERROR - default DB ' + operation.toUpperCase() + ' callback:\n', JSON.stringify(err, null, ' '))
    }
    console.log('SUCCESS - default DB ' + operation.toUpperCase() + ' callback');
    result && console.log('Result:\n', JSON.stringify(result, null, ' '))
  };
};

const init = ({
  collectionName = 'default',
  dbPath = path.join(__dirname, '/data'),
  callback = () => {}
} = {}) => {
  db = new Db(dbPath, {});
  collection = db.collection(collectionName);
  callback(null, collection);
};

const create = ({docs, callback = defaultCallback('create')} = {}) => {
  collection.insert(docs, {w:1}, callback);
};

const read = ({query, callback = defaultCallback('read')} = {}) => {
  collection.find(query).toArray(callback);
};

const update = ({query, update, callback = defaultCallback('update')} = {}) => {
  collection.update(query, { $set: update }, err => {
    if (err) return callback(err);
    collection.findOne(query, callback);
  });
};

const del = ({query, callback = defaultCallback('delete')} = {}) => {
  collection.remove(query, {safe: true}, callback);
};

module.exports = {
  init,
  create,
  read,
  update,
  del
}
