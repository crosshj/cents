
function pad(number){
  return (number < 10
    ? '0'
    : ''
  ) + Math.round(number);
}

function revert(input){
  return [
    20 + pad(input[0]*100),
    pad(input[1] * 12),
    pad(input[2] * 31),
    ' ',
    pad(input[3] * 24),
    ':',
    pad(input[4] * 60),
    ':',
    pad(input[5] * 60),
    ' ',
    input[6] ? 'already had' : 'got new'
  ].join('');
}

module.exports = revert;
