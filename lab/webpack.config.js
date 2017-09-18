"use strict";

const production = process.env.NODE_ENV === "production";
const debug = process.env.NODE_ENV !== "production";

const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "css/style.css",
    allChunks: true
});

module.exports = [
    {
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
            filename: 'js/bundle.js'
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
		    use: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
		} 
            ]
	}, 
	plugins: debug ? [extractSass] : [
            new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }),
            extractSass
	]
    },
        
    {
	// The configuration for the server-side rendering
	name: "server-side rendering",
	entry: "./src/server.js",
	target: "node",
	output: {
            path: path.join(__dirname, 'src', 'static'),
            filename: 'js/server.js'
	},
	
	externals: /^[a-z\-0-9]+$/,
	module: {
	   rules: [
		{ test: /\.js$/,
		  exclude: /node_modules/,
		  use: {
		      loader: 'babel-loader',
		      options: {
			  presets: [ "react", "es2015", "env" ],
			  plugins: [ ]
		      }
		  }
		}
	   ] 
	    
	}
    }   
    
];
