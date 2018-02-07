import { recipeIndex, recipeType, orderIndex, orderType, panelIndex, panelType, layoutIndex, layoutType, destinationIndex, destinationType, airfieldIndex, airfieldType, experienceIndex, experienceType, tripIndex, tripType } from './es.js';

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


     function deleteThenRun(indexName, callback) {
	
	ESClient.indices.delete({
	    index: indexName
	}).then(function(body){
	    callback() 
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

     function createTripIndex() {
	ESClient.indices.create({
	    index: tripIndex,
	    body: {
		mappings: {
		    trip: {
			properties : {
			    
			    date: { type: "date" },
			    name: { type: "text" },
			    "departureAirfield": { type: "text" },
			    "destinationAirfield": { type: "text" },

			    "departureLocation": { type: "geo_point" },
			    "destinationLocation": { type: "geo_point" },
			   
			    "crew" : {
				properties: {
				    name: { type: "text" },
				    email: { type: "text" }
				}	
			    }
			    
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

     function createExperienceIndex() {
	ESClient.indices.create({
	    index: experienceIndex,
	    body: {
		mappings: {
		    experience: {
			properties : {
			    
			    title: { type: "text" },
			    status: { type: "keyword" },
			    location: { type: "geo_point" },
			    descriptionDraftJs: {
				enabled: false
			    },
			    descriptionPlainText: { type: "text" },
			    tags : { type: "keyword" },
			    authors: {
				properties: {
				    name: { type: "text" },
				    email: { type: "text" }
				}
			    },
			    trips: { type: "keyword" }
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
    runIfIndexDoesNotExist(tripIndex, createTripIndex)
    // deleteThenRun(experienceIndex, createExperienceIndex)
    runIfIndexDoesNotExist(experienceIndex, createExperienceIndex)
  
    
}


module.exports = {
    prepES
}
