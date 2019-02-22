var webpack = require('webpack');
var merge = require('webpack-merge');
var CompressionPlugin = require('compression-webpack-plugin');
var common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',

  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
    new CompressionPlugin({
      test: /\.js/,
      filename (asset) {
        return asset.replace('.gz', '')
      }
    })
  ]
});
