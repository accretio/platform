'use strict';

import fetch from 'isomorphic-fetch';

function getEntity(type) {

    function jsUcfirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (function(id) {

	return (fetch('/api/get'+(jsUcfirst(type)), {
            method: 'post',
            headers: new Headers({
		'Content-Type': 'application/json'
            }),
	    body: JSON.stringify({ id : id })
        }).then(function(response) {
	    if (response.status == 200) {
		return (response.json())
	    } else {
		throw new Exception("something went wrong")
	    }
	}))
	
    })
    
}

var getPanel = getEntity("panel")
var getLayout = getEntity("layout")
var getTrip = getEntity("trip")

// getExperience is a bit more difficult because we need to hydrate the trips
function getExperience(id, language) {
    return (fetch('/api/getFullExperience', {
        method: 'post',
        headers: new Headers({
	    'Content-Type': 'application/json'
        }),
	body: JSON.stringify({ id : id, language: language })
        }).then(function(response) {
	    if (response.status == 200) {
		return (response.json())
	    } else {
		throw new Exception("something went wrong")
	    }
	}))
}


function savePanel(panel) {
    return(fetch('/api/savePanel', {
        method: 'post',
        headers: new Headers({
	    'Content-Type': 'application/json'
        }),
        body: JSON.stringify(panel) 
    }).then(function(response) {
	if (response.status == 200) {
	    return (response.json())
	} else {
	    alert("something went wrong")
	    throw new Exception("something went wrong")
	}
    }))
}

function listLayouts(query) {
    return(fetch('/api/listLayouts', {
	method: 'post',
	headers: new Headers({
	    'Content-Type': 'application/json'
       	}),
	body: JSON.stringify({ query: query })
    }).then(function(response) {
	if (response.status == 200) {
	    return (response.json())
	} else {
	    alert("something went wrong")
	    throw new Exception("something went wrong")
	}
    }))
}

// new methods for GA Adventures

function save(path){

    return function(obj){
	return(fetch('/api/'+path, {
            method: 'post',
            headers: new Headers({
		'Content-Type': 'application/json'
            }),
            body: JSON.stringify(obj) 
	}).then(function(response) {
	    if (response.status == 200) {
		return (response.json())
	    } else {
		alert("something went wrong")
		throw new Exception("something went wrong")
	    }
	}))
	
    }
}

const saveSuggestion = save('saveSuggestion')
const saveAirfield = save('saveAirfield')
const saveExperience = save('saveExperience')
const saveProfile = save('saveProfile')

function getAllDestinations() {
    return(fetch('/api/getAllDestinations', {
	method: 'get'
    }).then(function(response) {
	if (response.status == 200) {
	    return (response.json())
	} else {
	    alert("something went wrong")
	    throw new Exception("something went wrong")
	}
    }))
}

function getAllExperiences() {
    return(fetch('/api/getAllExperiences', {
	method: 'get'
    }).then(function(response) {
	if (response.status == 200) {
	    return (response.json())
	} else {
	    throw new Exception("something went wrong")
	}
    }))
}

function autocompleteAirfields(query) {
    return(fetch('/api/autocompleteAirfields?prefix=' + encodeURIComponent(query), {
	method: 'get'
    }).then(function(response) {
	if (response.status == 200) {
	    return (response.json())
	} else {
	    alert("something went wrong")
	    throw new Exception("something went wrong")
	}
    }))

}

function updateDestination(id, doc) {
    return(fetch('/api/updateDestination', {
        method: 'post',
        headers: new Headers({
	    'Content-Type': 'application/json'
        }),
        body: JSON.stringify({id: id, doc: doc}) 
    }).then(function(response) {
	if (response.status == 200) {
	    return (response.json())
	} else {
	    alert("something went wrong")
	    throw new Exception("something went wrong")
	}
    }))
}


function updateExperience(id, doc) {
    return(fetch('/api/updateExperience', {
        method: 'post',
        headers: new Headers({
	    'Content-Type': 'application/json'
        }),
        body: JSON.stringify({id: id, doc: doc}) 
    }).then(function(response) {
	if (response.status == 200) {
	    return (response.json())
	} else {
	    throw new Exception("something went wrong")
	}
    }))
}

function saveExperienceDescription(id, language, descriptionContent, descriptionPlainText, filesUrls, tags) {
    console.log("saveExperienceDescription")
  return(fetch('/api/saveExperienceDescription', {
        method: 'post',
        headers: new Headers({
	    'Content-Type': 'application/json'
        }),
      body: JSON.stringify({id, language, descriptionContent, descriptionPlainText, filesUrls, tags}) 
    }).then(function(response) {
	if (response.status == 200) {
	    return (response.json())
	} else {
	    throw new Exception("something went wrong")
	}
    }))
}

function uploadImage(file) {
    var formData = new FormData();
    formData.append('image', file);
    return(fetch('/api/image-upload', {
        method: 'post',
        headers: new Headers({
	    'Accept': 'application/json'
        }),
	body: formData
    }).then(function(response) {
	if (response.status == 200) {
	    return (response.json())
	} else {
	    throw new Exception("something went wrong")
	}
    }))
}

function runSearchAroundAirfield(id, language) {
    console.log(id);
  return(fetch('/api/runSearchAroundAirfield?id=' + encodeURIComponent(id) + '&language=' + language, {
	method: 'get'
    }).then(function(response) {
	if (response.status == 200) {
	    return (response.json())
	} else {
	    throw new Exception("something went wrong")
	}
    }))

}

function shareTrip(trip) {
    
    return(fetch('/api/shareTrip', {
        method: 'post',
        headers: new Headers({
	    'Content-Type': 'application/json'
        }),
      body: JSON.stringify(trip) 
    }).then(function(response) {
	if (response.status == 200) {
	    return (response.json())
	} else {
	    throw new Exception("something went wrong")
	}
    }))

}



export { getPanel, getLayout, savePanel, listLayouts, saveSuggestion, autocompleteAirfields, getAllDestinations, updateDestination, runSearchAroundAirfield, saveAirfield, saveExperience, getExperience, getTrip, getAllExperiences, updateExperience, saveExperienceDescription, saveProfile, uploadImage, shareTrip };
