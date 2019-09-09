const accounts = require('./accounts');
const history = require('./history');
const login = require('./login');
const restart = require('./restart');

module.exports = function(app, passport) {
  
  // NOTE: can't do this because webpack
  //console.log({ thisDir: fs.readdirSync(__dirname)})
  // fs.readdirSync(__dirname).forEach(function(file) {
  //   if (file === "index.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js')
  //       return;
  //   var name = file.substr(0, file.indexOf('.'));
  //   require('./' + name)(app, passport);
  // });

  accounts(app, passport);
  history(app, passport);
  login(app, passport);
  restart(app, passport);
};
