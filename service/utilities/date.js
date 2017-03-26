function isValidDate(date){
  if (!date) return false;
  return Object.prototype.toString.call(date) === '[object Date]';
}

function stamp(date){
  if (!isValidDate(date)) date = new Date();

  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString().replace(/-/g,'').replace(/T/g,' ').substr(0,17);
}

module.exports = { stamp }
