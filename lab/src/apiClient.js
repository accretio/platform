'use strict';

import fetch from 'isomorphic-fetch';

function getPanel(id) {
    return (fetch('/api/getPanel', {
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

export { getPanel, savePanel };
