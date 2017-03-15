"use strict";

const debug = process.env.NODE_ENV !== "production";

const webpack = require('webpack');
const path = require('path');

//const nodeExternals = require('webpack-node-externals');

module.exports = {
  devtool: debug ? 'inline-sourcemap' : null,
  entry: [
    path.resolve(__dirname, "src/static/css/test.scss"),
    path.join(__dirname, 'src', 'app-client.js')
  ],
  //externals: [nodeExternals()],
  devServer: {
    inline: true,
    port: 3333,
    contentBase: "src/static/",
    historyApiFallback: {
      index: '/index-static.html'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000/api',
        secure: false
      }
    }
  },
  output: {
    path: path.join(__dirname, 'src', 'static', 'js'),
    publicPath: "/js/", 
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          cacheDirectory: 'babel_cache',
          presets: debug ? ['react', 'es2015', 'react-hmre'] : ['react', 'es2015']
        }
      },
      { test: /\.scss$/, loaders: [ "style-loader", "css-loader", "sass-loader" ] },
    ]
  }, 
  plugins: debug ? [] : [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      mangle: true,
      sourcemap: false,
      beautify: false,
      dead_code: true
    }),
  ]
};
