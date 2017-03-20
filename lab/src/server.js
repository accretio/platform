'use strict';


import path from 'path';

import { Server } from 'http';
import Express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from './routes';
import NotFoundPage from './components/NotFoundPage';
import { Button } from 'reactstrap';

import Recipe from './recipe';
import Order from './order';
import { notifyWorkshop } from './lib/slack';
import { env, port } from './config';

import AWS from 'aws-sdk';
import bodyParser from 'body-parser';
import elasticsearch from 'elasticsearch';

// import stripePackage from 'stripe';

// initialize the server and configure support for ejs templates
const app = new Express();
const server = new Server(app);

// initialize the AWS credentials
const credentials = new AWS.SharedIniFileCredentials({profile: 'accretio'});
AWS.config.credentials = credentials;

// initialize the ES client
const ESClient = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    httpAuth: 'elastic:changeme'
});

// initialize the stripe client
// const stripe = stripePackage('sk_test_g5POvv9nMfo0kQBCGoWSDFOt');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// define the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json({ type: 'application/json' }));

// api methods

app.use('/api/s3', require('react-s3-uploader/s3router')({
    bucket: "accretio-lab-files",
    region: 'us-west-1',
    headers: {'Access-Control-Allow-Origin': '*'}, // optional
    uploadRequestHeaders: {},
    ACL: 'private', // this is default
    uniquePrefix: false// (4.0.2 and above) default is true, setting the attribute to false preserves the original filename in S3
}));

var recipeIndex = "recipes";
var recipeType = "recipe";

var orderIndex = "order";
var orderType = "order";

app.post('/api/createRecipe', function(req, res){
    
    var recipe = new Recipe(req.body);

    ESClient.index({
        index: recipeIndex,
        type: recipeType,
        body: recipe.toESJson()
    }).then(function (body) {
        res.status(200);
        res.json({ id: body._id });
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    });
    
    
});

app.post('/api/getRecipe', function(req, res){

    var id = req.body.id;

    ESClient.get({
        index: recipeIndex,
        type: recipeType,
        id: id
    }).then(function (body) {
        res.status(200);
        res.json(body._source);
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    });
    
    
});


app.post('/api/createOrder', function(req, res){

    var order = new Order(req.body);
    
    ESClient.index({
        index: orderIndex,
        type: orderType,
        body: order.toESJson()
    }).then(function (body) {
        res.status(200);
        notifyWorkshop(body._id);
        res.json({ id: body._id });
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    });
    
    
});


// universal routing and rendering

app.get('*', (req, res) => {
    match(
        { routes, location: req.url },
        (err, redirectLocation, renderProps) => {
            console.error(err);
            // in case of error display the error message
            if (err) {
                return res.status(500).send(err.message);
            }

            // in case of redirect propagate the redirect to the browser
            if (redirectLocation) {
                return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
            }

            // generate the React markup for the current route
            let markup;
            if (renderProps) {
                // if the current route matched we have renderProps
                markup = renderToString(<RouterContext {...renderProps}/>);
            } else { 
                // otherwise we can render a 404 page
                markup = renderToString(<NotfoundPage />);
                res.status(404);
            }

            // render the index template with the embedded React markup
            return res.render('index', { markup });
        }
    );
});

// start the server
server.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    console.info(`Server running on http://localhost:${port} [${env}]`);
});
