// http://ubuntu:27017/

// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://ubuntu:27017/cents-sessions", {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, function(err, client) {
  if(!err) {
    console.log("We are connected");
  }
  const db = client.db('hello');
  db.createCollection('test', {}, function(err, collection) {
    var doc1 = {'hello':'doc1'};
    var doc2 = {'hello':'doc2'};
    var lotsOfDocs = [{'hello':'doc3'}, {'hello':'doc4'}];

    collection.insertOne(doc1, function(err1, result1) {
        collection.insertOne(doc2, {w:1}, function(err2, result2) {
            collection.insertMany(lotsOfDocs, {w:1}, function(err3, result3) {
                console.log('finished inserting');
                client.close();
            });
        });
    });
  });

});