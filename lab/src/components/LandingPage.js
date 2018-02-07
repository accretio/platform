'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import fetch from 'isomorphic-fetch';

import { CookiesProvider, withCookies, Cookies } from 'react-cookie';

import { runSearchAroundAirfield } from './../apiClient.js';

import SearchBox from './SearchBox';
import DisplayResultsMap from './DisplayResultsMap.js';

export default class LandingPage extends React.Component {
    
    constructor(props) {
	super(props);
	this.state = {
	    results: [],
	    location: null,
	    fullJumbotron: true
	};
    }

    componentDidMount() {
        this.context.mixpanel.track('landing page loaded');

	
	window.scrollTo(0, 0)
    }

    _handleResults(location, results) {
	this.setState({ fullJumbotron: false, location: location, results: results })
    }
    
    render() {

	var t = this;

	console.log(this.state.results);
	
        var searchBox = <SearchBox handleResults= { this._handleResults.bind(this) } />;
        
	var header;

	if (this.state.fullJumbotron) {
		header = <div><h1 className="display-4">Where are you flying next?</h1>

	    <p className="lead">Browse aviation adventures. Plan your trip. Go fly!</p>

	    <hr className="my-4" />
		</div>;
	}


	
	
	return (
		<div className="landing-page">
		
		<div className="jumbotron-wrapper">
		<div className="jumbotron">
		    { header }
	    { searchBox }
	   
                </div>
		</div>

		<DisplayResultsMap centerOn={ this.state.location } results={ this.state.results } />
		
     </div>);

  }
}

LandingPage.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
