var app = require('express')();

const port = 3999;
require('./routes')(app);

app.listen(port);
console.log('Server running on port ', port)
