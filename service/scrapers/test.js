var scrapers = require('./index.js');

const callback = (err, data) => {
  if (err){
    return console.log('Error:\n', err);
  }
  console.log('USAA:\n', JSON.stringify(data, null, '  '));
};

scrapers.usaa(callback);
