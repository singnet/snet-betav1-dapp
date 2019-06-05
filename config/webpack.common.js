var path = require('path');
var webpack = require('webpack');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var MiniCssExtractPlugin = require("mini-css-extract-plugin");

var paths = require('./paths.js')

module.exports = function(isSandBox) {
  var codePath = isSandBox === 'true' ? paths.sandBoxPath : paths.srcPath;

  return {
  entry: path.join(codePath, 'index.js'),

  output: {
    path: paths.outPath,
    filename: 'bundle.[chunkhash:8].js'
  },

  devtool: 'source-map',
  devServer: {
    historyApiFallback: true,
    contentBase: paths.outPath,
    disableHostCheck: true
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: paths.srcPath,
        exclude: /node_modules/,
        options: {
          presets: [
            ['es2015', { modules: false }], 'react'
          ],
          plugins: [
            ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]
          ]
        }
      },
      {
        test: /\.css$/,
        use:  [
          'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader"
        }, {
          loader: "less-loader",
          options: {
            javascriptEnabled: true
          }
        }]
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[path][name].[hash].[ext]",
          },
        },
      },
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(paths.srcPath, 'index.html'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    })
  ]
}
};
