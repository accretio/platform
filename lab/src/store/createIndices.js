import { recipeIndex, recipeType, orderIndex, orderType, panelIndex, panelType, layoutIndex, layoutType, destinationIndex, destinationType, airfieldIndex, airfieldType } from './es.js';

import { loadAirfields } from './loadAirfields.js';

function prepES(ESClient) {
    
    function runIfIndexDoesNotExist(indexName, callback) {
	
	ESClient.indices.exists({
	    index: indexName
	}).then(function(body){
	    if (!body) {
		callback() 
	    } else {
		console.log("index " + indexName + " already exists")
	    }
	})
	
    }
    
    
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
    
    runIfIndexDoesNotExist(airfieldIndex, createAirfieldIndex)
    runIfIndexDoesNotExist(destinationIndex, createDestinationIndex)
    
    
}


module.exports = {
    prepES
}
