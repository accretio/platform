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
	    this.context.mixpanel.track('updating center', { center: this.currentCenter });
	    console.log(this.currentCenter);
	    nextState.map.panTo(this.currentCenter);
	}
    }
    
    render() {

	var this_ = this
	const { t, i18n } = this.props;

	var results = this.props.results

	var map = this.state.map

	var readMore = t('Details')
	
	if (map) {
	    console.log(results)
	    console.log(">>> rendering " + results.length + " results");
	    this.state.markers.clearLayers();
	    this.context.mixpanel.track('rendering results', { count: results.length });
	    results.map(function(result){
		console.log(result);

		var latlng = [ result.location.lat, result.location.lon ];
		var title = t(result.title)
		var url = "window.location.href='/experience/" + result.id + "'" 
		var popup = L.popup()
		    .setLatLng(latlng)
		    .setContent('<div class="name">' + title + '</div><div class="details"><button class="btn btn-info" onClick="' + url + '">' + readMore + '</button></div>')
		   
		var marker = L.marker(latlng);
		marker.bindPopup(popup);

		this_.state.markers.addLayer(marker);
		
	    })

	}

	return (<div className="display-results-map">
		   <div id="windyty" className="windyty"></div>
		</div>);

    }
    
}




DisplayResultsMap.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
