/* istanbul ignore file */

// make jest skip this file
if(test){ test.skip('skip', () => {}) }

/*
eslint-disable no-console
*/

var timestamp = require('./date').stamp;

console.log(timestamp('hello'));

console.log(timestamp());

var tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
console.log(timestamp(tomorrow));
