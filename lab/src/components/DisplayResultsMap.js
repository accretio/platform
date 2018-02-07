'use strict';

import React, { PropTypes} from 'react';

export default class DisplayResultsMap extends React.Component {

    constructor(props) {
	super(props)
	this.state = {
	    map: null,
	    markers: null,
	}
	this.currentCenter = null;
    }

    componentDidMount() {
	var t = this
	// load the windy api
	window.windytyInit =  {
	    // Required: API key
	    key: 'PsL-At-XpsPTZexBwUkO7Mx5I',
	    
	    // Optional: Initial state of the map
	    lat: 50.4,
	    lon: 14.3,
	    zoom: 5,
	}
	
	window.windytyMain = function(map) {
	    // W.setOverlay("clouds");
	    W.setOverlay("wind");
	    var markers = L.markerClusterGroup()
	    map.addLayer(markers);
	    t.setState({ map, markers })
	}
	
	const script = document.createElement("script");
        script.src = "https://api.windytv.com/v2.3/boot.js";
        script.async = true;
        document.body.appendChild(script);
    }

    componentWillUpdate(nextProps, nextState) {
	if (nextProps.centerOn && nextProps.centerOn != this.currenCenter && nextState.map) {
	    this.currentCenter = nextProps.centerOn;
	    console.log("new center is ");
	    console.log(this.currentCenter);
	    nextState.map.panTo(this.currentCenter);
	}
    }
    
    render() {

	var t = this
	var results = this.props.results

	var map = this.state.map
	if (map) {
	    console.log(results)
	    console.log(">>> rendering " + results.length + " results");
	    this.state.markers.clearLayers();
	    results.map(function(result){
		console.log(result);

		var latlng = [ result.location.lat, result.location.lon ];
		var popup = L.popup()
		    .setLatLng(latlng)
		    .setContent(result.title)
		   
		var marker = L.marker(latlng);
		marker.bindPopup(popup);

		t.state.markers.addLayer(marker);
		
	    })

	}

	return (<div className="display-results-map">
		
		<div id="windyty" className="windyty"></div>
	       </div>);

    }
    
}
