var webpack = require('webpack');
var merge = require('webpack-merge');
var TerserPlugin = require('terser-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
    new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
  ]
});
