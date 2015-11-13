/*

https://www.npmjs.com/package/jsondiffpatch


the idea:

client cache's accounts json and a hash of this

server keeps a patch, hash file for every state entered

server keeps current state as whole json


when client requests json, we commpare hashes

	1) no change - send client small message saying so

	2) small/medium change - send patchs, patch set

	3) large change / no hash match - send whole json

*/