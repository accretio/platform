'use strict';

import path from 'path';

import { Server } from 'http';
import Express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from './routes';

import { CookiesProvider, withCookies, Cookies } from 'react-cookie';


import NotFoundPage from './components/NotFoundPage';
import { Button } from 'reactstrap';

import Recipe from './recipe';
import Order from './order';
import { notifyWorkshop } from './lib/slack';
import { env, port, elasticsearch_endpoint } from './config';

import AWS from 'aws-sdk';
import bodyParser from 'body-parser';
import elasticsearch from 'elasticsearch';

import stripePackage from 'stripe';

import { stripe_sk, aws_credentials, s3_bucket_name } from './config.js';
import { recipeIndex, recipeType, orderIndex, orderType, panelIndex, panelType, layoutIndex, layoutType } from './store/es.js';

var config = require('./config');

// initialize the server and configure support for ejs templates
const app = new Express();
const server = new Server(app);

// initialize the AWS credentials
const credentials = new AWS.Credentials(aws_credentials);
AWS.config.credentials = credentials;

// initialize the ES client
const ESClient = new elasticsearch.Client({
    host: `${elasticsearch_endpoint}:9200`,
    log: 'trace',
    httpAuth: 'elastic:changeme'
});

// initialize the stripe client
const stripe = stripePackage(stripe_sk);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// define the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json({ type: 'application/json' }));

// api methods

app.post('/api/savePanel', function(req, res){
 
    ESClient.index({
        index: panelIndex,
        type: panelType,
	id : req.body.id,
        body: req.body
    }).then(function (body) {
	console.log(body);
        res.status(200);
        res.json({ id: body._id });
    }, function (error) {
        console.log(error);
        res.status(500);
        res.send(error.message);
    });
    
});


function getESEntity(index, type) {

    function jsUcfirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    app.post('/api/get' + jsUcfirst(type), function(req, res){
	var id = req.body.id
	console.log(">>> getting " + type + " id " + id)
	ESClient.get({
            index: index,
            type: type,
            id: id
	}).then(function (body) {
	    console.log("got a reply")
            res.status(200);
	    console.log(">>> result")
	    console.log(body)
            var entity = body._source
	    entity.id = id
            res.json(entity)
	}, function (error) {
	    console.trace(error.message);
            res.status(500);
            res.send(error.message);
	});	
    })
    
}


app.post('/api/getLayout2', function(req, res){
    var id = req.body.id
    ESClient.get({
        index: layoutIndex,
        type: layoutType,
        id: id
     }).then(function (body) {
         res.status(200);
	 console.log(">>> result")
	 console.log(body)
         var panel = body._source
	 panel.id = id
         res.json(panel)
     }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    });
    
})

getESEntity(panelIndex, panelType);
getESEntity(layoutIndex, layoutType);

app.post('/api/listLayouts', function(req, res){
    console.log("query is " + req.body.query)
    ESClient.search({
        index: layoutIndex,
        type: layoutType,
	q: req.body.query
    }).then(function (body) {
        res.status(200)
	res.json(body.hits.hits.map(function(hit) { return { name: hit._source.name, id: hit._source.id }}))
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    });
})

// Old API methods

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
        var recipe = body._source;
        recipe.id = id;
        res.json(recipe);
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

app.post('/api/updateOrder', function(req, res){

    ESClient.update({
        index: orderIndex,
        type: orderType,
        id: req.body.id,
        body: {
            doc: req.body.doc
        }
    }).then(function (body) {
        res.status(200);
        res.json({ id: req.body.id });
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    });
    
});

app.post('/api/chargeOrder', function(req, res){

    console.log("got charge request");
     ESClient.get({
        index: orderIndex,
        type: orderType,
        id: req.body.id
     }).then(function (body) {

         var order = body._source;
         var token = order.token.id;
         console.log("token is " + token);
         ESClient.get({
             index: recipeIndex,
             type: recipeType,
             id: order.recipe.id
         }).then(function (body) {

             var recipe = body._source;
             var price = recipe.price;
             console.log("price is " + price);
             stripe.charges.create({
                 amount: price * 100, // amount is in cents
                 currency: "usd",
                 source: token,
                 description: ("Charge for " + recipe.name)
             }).then(function(result){
                 console.log("charged"); 
                 ESClient.update({
                     index: orderIndex,
                     type: orderType,
                     id: req.body.id,
                     refresh: true,
                     body: {
                         doc: { status: "charged" }
                     }
                 }).then(function (body) {
                     res.status(200);
                     res.json({ id: result.id });
                 }, function (error) {
                     console.trace(error.message);
                     res.status(500);
                     res.send(error.message);
                 });
                 
             }, function(error){
                 console.log(error);
                 res.status(500);
                 res.json({ error: error.message });
             });
         
         }, function(error){
                 console.log(error);
                 res.status(500);
                 res.json({ error: error.message });
             });
     }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    });
    
});

app.post('/api/admin/search', function(req, res){

    var query = req.body.query;

    console.log('running query: ' + query);
    
    ESClient.search({
        index: orderIndex,
        q: query
    }).then(function (response) {
        res.status(200);
        res.json(response);
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
                markup = renderToString(<CookiesProvider><RouterContext {...renderProps}/></CookiesProvider>);
            } else { 
                // otherwise we can render a 404 page
                markup = renderToString(<NotfoundPage />);
                res.status(404);
            }

            // render the index template with the embedded React markup
            return res.render('index', { markup, config: JSON.stringify(config)});
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
