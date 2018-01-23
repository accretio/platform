var csv = require('fast-csv');
import * as fs from 'fs';

import { airfieldIndex, airfieldType } from '../store/es.js'


// this import code relies on the fact that the ids won't change.
// it also overrides the airfield document at each restart
// and it uses the asynchronous ES client that we can't make synchronous
// so we have no idea if the writes actually succeded

function loadAirfields(ESClient) {
    console.log("loading all airfields in ES");

    // TODO: move that file out
    var stream = fs.createReadStream("/Users/wleferrand/Downloads/airports.csv");

    var csvStream = csv()
	.on("data", function(data){
	    
	var airport = {
	    id: data[0],
	    identifier: data[1],
	    name: data[3],
	    location: { 
         	lat: data[4],
		lon: data[5]
	    }
	}

	ESClient.index({
            index: airfieldIndex,
            type: airfieldType,
	    id : airport.id,
            body: airport
	})	
        console.log(airport);
    })
	.on("end", function(){
            console.log("all airfields are loaded");
	});
    
    stream.pipe(csvStream);

}


module.exports = {
    loadAirfields
}
