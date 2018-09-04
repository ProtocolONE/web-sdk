const config = require('./webpack.common');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

config.plugins = config.plugins.concat([
  new UglifyJSPlugin({})
]);

module.exports = config;
