"use strict";

const production = process.env.NODE_ENV === "production";
const debug = process.env.NODE_ENV !== "production";

const webpack = require('webpack');
const path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    devtool: false,
    entry: [
        path.join(__dirname, 'src', 'app-client.js'),
        path.join(__dirname, 'src', 'style', 'style.scss')
    ],
    
    // externals: [nodeExternals()],
    devServer: {
        inline: true,
        port: 3333,
        contentBase: "src/static/",
        historyApiFallback: {
            index: '/index-static.html'
        },
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                secure: false
            }
        }
    },
    output: {
        path: path.join(__dirname, 'src', 'static'),
        filename: '/js/bundle.js'
    },
    module: {
       
        rules: [
            /*
             your other rules for JavaScript transpiling go in here
             */
             { test: /\.js$/,
              exclude: /node_modules/,
              loader: "babel-loader",
              query: {
                  cacheDirectory: 'babel_cache',
                  presets: debug ? ['react', 'es2015', 'react-hmre'] : ['react', 'es2015']
              }
             },
            { // sass / scss loader for webpack
                test: /\.(sass|scss)$/,
                loaders: ['css-loader', 'sass-loader']
            } 
        ]
    }, 
    plugins: debug ? [] : [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        new ExtractTextPlugin({
			filename: "/css/style.css",
			allChunks: true
	}),
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            mangle: true,
            sourcemap: false,
            beautify: false,
            dead_code: true
        }),
    ]
};
