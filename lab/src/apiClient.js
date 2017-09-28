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
		alert("something went wrong")
		throw new Exception("something went wrong")
	    }
	}))
	
    })
    
}

var getPanel = getEntity("panel")
var getLayout = getEntity("layout")

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

export { getPanel, getLayout, savePanel, listLayouts };
