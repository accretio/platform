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
import { recipeIndex, recipeType, orderIndex, orderType, panelIndex, panelType, layoutIndex, layoutType, destinationIndex, destinationType, airfieldIndex, airfieldType, experienceIndex, experienceType, tripIndex, tripType, profileIndex, profileType } from './store/es.js';

import { prepES } from './store/createIndices.js';

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


function withAirfield(res, id) {
    return (ESClient.get({
	index: airfieldIndex,
        type: airfieldType,
	id: id
    }).then(function(doc) {
	return(doc._source)
    }, function(error) {
        console.trace(error.message);
        res.status(500);
        res.send(error.message);
    }))
}


function store(index, type) {
    return function (res, obj) {
	return (ESClient.index({
	    index: index,
	    type: type,
	    body: obj
	}).then(function (body) {
	    return body._id;
	}, function (error) {
            console.log(error);
            res.status(500);
            res.send(error.message);
	}));
    }
}

const storeTrip = store(tripIndex, tripType);
const storeExperience = store(experienceIndex, experienceType);
const storeProfile = store(profileIndex, profileType);

app.post('/api/saveExperience', function(req, res){

    console.log("saving experience " + req)

    withAirfield(res, req.body.trip.departureAirfield.id).then(function(departureAirfield){
	
	withAirfield(res, req.body.trip.destinationAirfield.id).then(function(destinationAirfield){

	    var experienceLocation = departureAirfield.location;
	    
	    var trip = req.body.trip;

	    var tripPersisted =
		{
		    date: trip.date,
		    departureAirfield: departureAirfield.id,
		    destinationAirfield: destinationAirfield.id,
		    departureLocation: departureAirfield.location,
		    destinationLocation: destinationAirfield.location,
		    crew: trip.crew,
		    name: ''
		}
	    
	    storeTrip(res, tripPersisted).then(function(tripId){
		console.log("TRIP ID is " + tripId)
		var experience = req.body
	
		var experiencePersisted = {
		    title: experience.title,
		    status: "published",
		    location: destinationAirfield.location,
		    descriptionDraftJs: experience.descriptionDraftJs,
		    descriptionPlainText: experience.descriptionPlainText,
		    tags: experience.tags,
		    authors: [ experience.author ],
		    trips: [ tripId ]
		}
		
		// now we can store the whole experience
		storeExperience(res, experiencePersisted).then(function(experienceId) {
		    
		    res.status(200);
		    res.json({ id: experienceId });
		    
		})
	    })
	})
    })

})


app.post('/api/saveProfile', function(req, res){

    console.log("saving profile " + req)

    withAirfield(res, req.body.base.id).then(function(baseAirfield){
	

	var location = baseAirfield.location;
	    
	var profile = req.body
	
	var profilePersisted =
		{
		    location: location,
		    base: baseAirfield.id,
		    name: profile.name,
		    email: profile.email,
		    availabilities: profile.availabilities
		}
	    
	// now we can store the whole experience
	storeProfile(res, profilePersisted).then(function(profileId) {
	    
	    res.status(200);
	    res.json({ id: profileId });
	    
	})
	
    })
    
})

app.post('/api/saveAirfield', function(req, res){

    console.log("saving airfield " + req)

    

    
 ESClient.search({
     index: airfieldIndex,
     type: airfieldType,
     body: {
	 query: {
	     term : { identifier : req.body.identifier }
	 },
     }}).then(function(body) {

	 if (body.hits.hits.length > 0) {
	     console.log("there is already an airfield with identifier "  + req.body.identifier);
	     res.status(500);
             res.send("airfield already exists");
	 } else {

	     var airfield =
		 {
		     identifier: req.body.identifier,
		     name: req.body.name,
		     suggest: [ {
			 input: req.body.identifier,
			    weight: 1
		     }, {
			 input: req.body.name,
			 weight: 1
		     }],
		     location: { 
         		 lat: req.body.location.lat,
			 lon: req.body.location.lon
		     }
		 }

	     	ESClient.index({
		    index: airfieldIndex,
		    type: airfieldType,
		    body: airfield
		}).then(function(){
		    res.status(200);
		    res.json(airfield);
		}, function(error) {
		    console.trace(error.message);
		    res.status(500);
		    res.send(error.message);
		})
	 }

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


app.get('/api/getAllExperiences', function(req, res){

    ESClient.search({
	index: experienceIndex,
        type: experienceType,
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


// TODO: ACL
app.post('/api/updateExperience', function(req, res) {

    ESClient.update({
	index: experienceIndex,
	type: experienceType,
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

app.post('/api/saveExperienceDescription', function(req, res) {

    ESClient.get({
            index: experienceIndex,
            type: experienceType,
            id: req.body.id
    }).then(function (body) {

	var doc = body._source
	doc.descriptionDraftJs = req.body.descriptionContent,
	doc.descriptionPlainText= req.body.descriptionPlainText

	console.log("updating the doc")
	console.log(doc);

	/* KEEP IT AROUND 
	  return(ESClient.update({
	    index: experienceIndex,
	    type: experienceType,
	    id: req.body.id,
	    body: {
		script : {
		    "source": "ctx._source.descriptionDraftJs = params.descriptionDraftJs",
		    "lang": "painless",
		    "params" : {
			"descriptionDraftJs" : req.body.descriptionContent
		    }
		}
	    }
	})) */
	
	return(ESClient.update({
	    index: experienceIndex,
	    type: experienceType,
	    id: req.body.id,
	    body: {
		doc
	    }
	}))
	       
    }).then(function (body) {
	res.status(200);
        res.json({ id: body._id });
    }, function (error) {
        console.log(error);
        res.status(500);
        res.send(error.message);
    })

   
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
	    index: experienceIndex,
            type: experienceType,
	    body: {
		query: {
		    bool: {
			"must" : {
			    term : { status : "published" }
			}, 
			"filter" : {
			    "geo_distance" : {
				"distance" : config.max_distance+"mi",
				"location" : location
			    }
			}
		    }
		},
		
		sort: [
		    {
			"_geo_distance": {
			    "location": location,
			    "order":         "asc",
			    "unit":          "nauticalmiles", 
			    "distance_type": "plane" 
			}
		    }
		]
	    }

	}).then(function(body) {
	    res.status(200)
	    res.json({
		location: location,
		results: body.hits.hits.map(function(hit) { return {
		    id: hit._id,
		    location: hit._source.location,
		    title: hit._source.title,
		    tags: hit._source.tags,
		    distance: Math.round(hit.sort[0])
		}
							  
							  })
	    })
 
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
getESEntity(experienceIndex, experienceType);
getESEntity(tripIndex, tripType);



function getFullAirfield(id) {
    console.log("looking for airfield")
    console.log(id)
    return (ESClient.get({
        index: airfieldIndex,
        type: airfieldType,
        id: id
    }).then(function (body) {
	var entity = body._source
	entity.id = body._id
	return entity
    }))
}


function getFullTrip(id) {
    return (ESClient.get({
            index: tripIndex,
            type: tripType,
            id: id
	}).then(function (body) {
	    var entity = body._source
	    entity.id = body._id
	    var promise =
		Promise.all([ getFullAirfield(entity.departureAirfield),
			       getFullAirfield(entity.destinationAirfield) ])

	    return (promise.then(function(airfields) { return { entity, airfields } }))
	}).then(function(entityWithAirfields){
	    var entity = entityWithAirfields.entity
	    entity.departureAirfield = entityWithAirfields.airfields[0]
	    entity.destinationAirfield = entityWithAirfields.airfields[1]
	    return entity ;
	}))
}

app.post('/api/getFullExperience', function(req, res){
	var id = req.body.id
	console.log(">>> getting full experience " + id)
	ESClient.get({
            index: experienceIndex,
            type: experienceType,
            id: id
	}).then(function (body) {
	    var trips = body._source.trips
	    return (
		Promise.all(trips.map(getFullTrip))
		    .then(function(trips){ return { body, trips } })
		   )
	}).then(function (tripsAndBody) {
	    console.log(tripsAndBody)
	    var trips = tripsAndBody.trips
	    var body = tripsAndBody.body 
	    var experience = body._source
	    experience.id = body._id
	    experience.trips = trips;
	    res.status(200);
	    res.json(experience)
	},  function (error) {
	    console.log(error.message);
	    console.trace(error.message);
            res.status(404);
            res.send(error.message);
	});	
 })

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
		"query": {
		    "bool": {
			"should": [
			    {
				"term" : { identifier : req.query.prefix }
			    }, {
				"term" : { identifier : "k" + req.query.prefix }
			    }
			]
		    }	    
		}
	    }
	}).then(function (body) {

	    var exactMatches = body.hits.hits
	    return(ESClient.search(
		{
		    index: airfieldIndex,
		    body: {
			"suggest": {
			    "airfields" : {
				"prefix" : req.query.prefix, 
				"completion" : { 
				    "field" : "suggest",
				    
				}
			    }
			}
		    }
		}
	    ).then(function(body) { return { body, exactMatches } }))

	}).then(function (bodyAndExactMatches) {
	    res.status(200)

	    var items = bodyAndExactMatches.body.suggest.airfields[0].options.map(function(res) {
		var r = res._source
		r.id = res._id
		return r;
	    })

	    var itemsIds = items.map(function(item){ return item.id })

	    bodyAndExactMatches.exactMatches.map(function(m) {
		if (itemsIds.indexOf(m._id) == -1) {
		    var r = m._source
		    r.id = m._id
		    items.unshift(r)
		}
	    })
	    
	    res.json(items.map(function(source) {
		return { name: source.name + ' - ' + source.identifier, id: source.id }
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


prepES(ESClient);



// start the server
server.listen(port, err => {
    if (err) {
        return console.error(err);
    }
   
    console.info(`Server running on http://localhost:${port} [${env}]`);
});
