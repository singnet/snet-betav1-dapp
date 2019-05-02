var merge = require('webpack-merge');
var common = require('./webpack.common.js');
var MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = env => {
    return merge(common(env.sandBox), {
    mode: 'development',
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'css/[name].css'
      })
    ]
  });
}
