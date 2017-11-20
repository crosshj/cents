function getScrapers(privateInfo){
  return {
    usaa: require('./usaa.es6')(privateInfo.usaa())
  };
}

module.exports = getScrapers; 
