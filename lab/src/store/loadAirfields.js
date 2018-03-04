var csv = require('fast-csv');
var request = require('request');

import * as fs from 'fs';

import { airfieldIndex, airfieldType } from '../store/es.js'


// this import code relies on the fact that the ids won't change.
// it also overrides the airfield document at each restart
// and it uses the asynchronous ES client that we can't make synchronous
// so we have no idea if the writes actually succeded

function loadAirfields(ESClient) {

    try {
	console.log("loading all airfields in ES");
		
	request('http://ourairports.com/data/airports.csv').pipe(fs.createWriteStream('/tmp/airports.csv')).on('finish', function () {
	    
	    var stream = fs.createReadStream("/Users/wleferrand/Downloads/airports.csv");
	    
	    var csvStream = csv()
		.transform(function(data, next){
		    var airport = {
			id: data[0],
			identifier: data[1],
			name: data[3],
			suggest: [ {
			    input: data[3],
			    weight: 1
			}, {
			    input: data[1],
			    weight: 1
			}],
			location: { 
         		    lat: data[4],
			    lon: data[5]
			}
		    }
		    if (airport.id == 'id') {
			next()
		    } else {
			ESClient.index({
			    index: airfieldIndex,
			    type: airfieldType,
			    id : airport.id,
			    body: airport
			}).then(function(){
			    next()
			})
		    }
		    
		})
		.on("end", function(){
		    console.log("all airfields are loaded");
		});
	    
	    stream.pipe(csvStream);
	    
	})

    } catch(err) {
	console.error(err)
    }
}


module.exports = {
    loadAirfields
}
