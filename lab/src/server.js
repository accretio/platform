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
import { recipeIndex, recipeType, orderIndex, orderType, panelIndex, panelType, layoutIndex, layoutType, destinationIndex, destinationType, airfieldIndex, airfieldType } from './store/es.js';
import { loadAirfields } from './store/loadAirfields.js';


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



// new api methods for GA lunches

/* this methods inserts the suggestion in the destination db
   but doesn't make it available for search yet. it also triggers
   a notification to the admin for manual review */

app.post('/api/saveSuggestion', function(req, res){

    console.log("saving suggestion " + req)

 ESClient.get({
	index: airfieldIndex,
        type: airfieldType,
	id: req.body.airfield
    }).then(function(doc) {
	console.log(doc)

	var location = doc._source.location

    
    var destination = {	
	status: "submitted",
	airfield: req.body.airfield,
	airfield_name: req.body.airfield_name, // a bit useless, used for redundancy in case the ids are reshuffled in the csv
	airfield_location: location, // needed for the search
	type: "restaurant",
	opinion: "", 
	reviewers: [
	    {
		email: req.body.reviewerEmail,
		review: req.body.review
	    }
	],
	name: req.body.restaurantName	
    }

    console.log(destination)
    
    ESClient.index({
	index: destinationIndex,
	type: destinationType,
	body: destination
    }).then(function (body) {
	    res.status(200);
            res.json({ id: body._id });
	}, function (error) {
            console.log(error);
            res.status(500);
            res.send(error.message);
	});

    }, function(error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    })
   
})

app.post('/api/updateDestination', function(req, res) {

    ESClient.update({
	index: destinationIndex,
	type: destinationType,
	id: req.body.id,
	body: {
	    doc: req.body.doc 
	}
    }).then(function (body) {
	res.status(200);
        res.json({ id: body._id });
    }, function (error) {
            console.log(error);
            res.status(500);
        res.send(error.message);
    })
   
})

app.get('/api/getAllDestinations', function(req, res){

    ESClient.search({
	index: destinationIndex,
        type: destinationType,
	body: {
	    query: {
		match_all: {}
	    }
	}
    }).then(function (body) {
        res.status(200)
	res.json(body.hits.hits.map(function(hit) { return { id: hit._id, result: hit._source } }))
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    });

})


app.get('/api/runSearchAroundAirfield', function(req, res){
    console.log("running search around " + req.query.id)
    ESClient.get({
	index: airfieldIndex,
        type: airfieldType,
	id: req.query.id
    }).then(function(doc) {
	console.log(doc)

	var location = doc._source.location

	ESClient.search({
	    index: destinationIndex,
            type: destinationType,
	    body: {
		query: {
		    bool: {
			"must" : {
			    term : { status : "published" }
			}, 
			"filter" : {
			    "geo_distance" : {
				"distance" : config.max_distance+"mi",
				"airfield_location" : location
			    }
			}
		    }
		},
		
		sort: [
		    {
			"_geo_distance": {
			    "airfield_location": location,
			    "order":         "asc",
			    "unit":          "nauticalmiles", 
			    "distance_type": "plane" 
			}
		    }
		]
	    }

	}).then(function(body) {
	    res.status(200)
	    res.json(body.hits.hits.map(function(hit) { return {
		id: hit._id,
		result: hit._source,
		distance: Math.round(hit.sort[0])
	    } }))
 
	}, function(error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
	})
	
    }, function(error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    })
	
   
})

// api methods

app.post('/api/savePanel', function(req, res){
 
    ESClient.index({
        index: panelIndex,
        type: panelType,
	id : req.body.id,
        body: req.body
    }).then(function (body) {
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
	    res.status(200);
	    var entity = body._source
	    entity.id = id
            res.json(entity)
	}, function (error) {
	    console.trace(error.message);
            res.status(404);
            res.send(error.message);
	});	
    })
    
}

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
	res.json(body.hits.hits.map(function(hit) { return { name: hit._source.name, id: hit._id }}))
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


app.get('/api/autocompleteAirfields', function(req, res){
    console.log("autocomplete request for " + req.query.prefix)
    ESClient.search(
	{
	    index: airfieldIndex,

	    
	    body: {
		"suggest": {
		    "airfields" : {
			"prefix" : req.query.prefix, 
			"completion" : { 
			    "field" : "suggest" 
			}
		    }
		}
	    }
	}
    ).then(function (body) {
	res.status(200)
	res.json(body.suggest.airfields[0].options.map(function(res) {
	    return { name: res._source.name + ' - ' + res._source.identifier, id: res._id }

	}))
    }, function (error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    }); 
    
})

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


// load all the airfields & add the mapping



ESClient.indices.exists({
    index: airfieldIndex
}).then(function(body){
    if (!body) {
	createAirfieldIndex()
    } 
})




ESClient.indices.exists({
    index: destinationIndex
}).then(function(body){
    if (!body) {
	createDestinationIndex()
    } 
})

function createAirfieldIndex() {
    ESClient.indices.create({
	index: airfieldIndex,
	body: {
	    mappings: {
		airfield: {
		    properties : {
			id: { "type": "text" },
			identifier: { "type": "text" },
  			location: { "type": "geo_point" },
			name : { "type": "text" },
			suggest : { "type" : "completion" },
		    }
		}
		
	    }
	} 
    }).then(function (body) {
	console.log("we can load all airfields")
	loadAirfields(ESClient);
    }, function (error) {
	console.log(error)
	console.trace(error.message);
    });
    
}


function createDestinationIndex() {
    ESClient.indices.create({
	index: destinationIndex,
	body: {
	    mappings: {
		destination: {
		    properties : {
			
			status: { type: "text" },
			"airfield": { type: "text" },
			"airfield_name": { type: "text" },
			"airfield_location": { type: "geo_point" },
			
			"type": { type: "text" },
			"opinion": { type: "text" },
			"reviewers" : {
			    properties: {
				email: { type: "text" },
				review: { type: "text" }
			    }

			},

			
			"name": { type: "text" }
		    }
		    
		}
		
	    }
	} 
    }).then(function (body) {
	
    }, function (error) {
	console.log(error)
	console.trace(error.message);
    });
    
}

// start the server
server.listen(port, err => {
    if (err) {
        return console.error(err);
    }
   
    console.info(`Server running on http://localhost:${port} [${env}]`);
});
