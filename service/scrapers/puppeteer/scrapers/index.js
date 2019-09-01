function getScrapers(privateInfo){
  return {
    usaa: require('./usaa.es6')(privateInfo.usaa()),
    discover: require('./discover.es6')(privateInfo.discover())
  };
}

module.exports = getScrapers;
