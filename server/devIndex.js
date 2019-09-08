
console.log('Using Webpack Dev Middleware (NOT)!');
const webpack = require('webpack');
//const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../webpack.config.js');
const webpackCompilerCallback = (err, output) => {
  if (err) {
    console.log('--- webpack compile error ---');
    console.log(JSON.stringify(err));
    return;
  }
  console.log('Webpack finished build.');
  //console.log({ output });
  //console.log(Object.keys(output));
  //console.log(JSON.stringify(output.toJson()));
  // webpackCompiler.watch({}, (err, stats) => {
  //   if(err) {
  //     console.log({ err });
  //   }
  //   console.log('Webpack finished build.');
  //   //console.log({ stats });
  // });
  //require('../dist/server/vendor');
  require('../dist/server');
};
//console.log(Object.keys(webpack));
webpackConfig.watch = true;
  /*const webpackCompiler =*/ webpack(webpackConfig, webpackCompilerCallback);
// const webpackCompiler = webpack(webpackConfig, function(err, stats) {
//   if (err) { return console.log(err); }
//   console.log();
//   console.log(stats.toString({
//     chunks: false,
//     modules: false,
//     chunkOrigins: false,
//     colors: true
//   }));
//   console.log(`\nDone. Server ready on port ${appPort}.`);
//   return;
// });
//const publicPath = require('path').resolve(__dirname, '../dist/client');
//console.log({ publicPath })
// app.use(webpackDevMiddleware(webpackCompiler, {
//   publicPath,
//   writeToDisk: true,
//   quiet: false,
//   lazy: true,
//   watchOptions: {
//     poll: true
//   },
//   stats: {
//     colors: true
//   }
// }));

