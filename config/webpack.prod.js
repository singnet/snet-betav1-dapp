var webpack = require('webpack');
var merge = require('webpack-merge');
var CompressionPlugin = require('compression-webpack-plugin');
var TerserPlugin = require('terser-webpack-plugin');
var common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
    ],
  },
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
