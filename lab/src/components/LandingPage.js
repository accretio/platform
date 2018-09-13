'use strict';

import React, { PropTypes} from 'react';
import { translate, Trans } from 'react-i18next';

import { Link } from 'react-router';
import fetch from 'isomorphic-fetch';

import { CookiesProvider, withCookies, Cookies } from 'react-cookie';

import { getAllExperiencesForLandingPage } from './../apiClient.js';

import SearchBox from './SearchBox'; 
import DisplayResultsMap from './DisplayResultsMap.js';
import DisplayResultsList from './DisplayResultsList.js';


class LandingPage extends React.Component {
    
    constructor(props) {
	super(props);
	var display = 'map';
	if (window.innerWidth < 800) {
	    display = 'list'; 
	}
	
	this.state = {
	    results: [],
	    location: null,
	    fullJumbotron: true,
	    display
	};
    }

    componentDidMount() {
        this.context.mixpanel.track('landing page loaded');
	window.scrollTo(0, 0)
	this._loadAllResults()
    }

    _loadAllResults() {

	const { i18n } = this.props;
	var this_ = this;

	getAllExperiencesForLandingPage(i18n.language).then(function(results) {
	    this_.setState({ fullJumbotron: false, results: results })
 	})

    }

    _handleResults(location, results) {
	this.setState({ fullJumbotron: false, location: location, results: results })
    }
    
    render() {

	const { t, i18n } = this.props;

	var searchBox = <SearchBox handleResults= { this._handleResults.bind(this) } t = { this.props.t } i18n = { this.props.i18n } />;
        
	var header;

	if (this.state.fullJumbotron) {
	    header = <div><h1 className="display-4">{ t('landing_page_title') } </h1>

		<p className="lead"> { t('landing_page_lead') } </p>

	    <hr className="my-4" />
		</div>;
	}

	var display;
	
	if (this.state.display == 'map') {
	    
	    display = <DisplayResultsMap centerOn={ this.state.location } results={ this.state.results }  t = { this.props.t } i18n = { this.props.i18n } history = { this.props.history } />
		
	    
	} else {
	    
	    display = <DisplayResultsList centerOn={ this.state.location } results={ this.state.results }  t = { this.props.t } i18n = { this.props.i18n } history = { this.props.history } />
		
	}

	
	return (
		<div className= { "landing-page display-type-" + this.state.display } >
		
	    { display }
		
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

export default (LandingPage);
