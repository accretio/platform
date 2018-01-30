'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import fetch from 'isomorphic-fetch';

import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';

const AsyncTypeahead = asyncContainer(Typeahead);

import { CookiesProvider, withCookies, Cookies } from 'react-cookie';

import { getAllDestinations, updateDestination, saveSuggestion, autocompleteAirfields } from './../apiClient.js';

import Modal from 'react-modal';

export default class ReviewDestinations extends React.Component {

    constructor(props) {
	super(props);
	this.state = {
	    thankYou: false,
	    error: null,
	    allowNew: false,
	    isLoading: false,
	    multiple: false,
	    options: [],
	    destinations: []
	};
    }

    componentDidMount() {
        this.context.mixpanel.track('suggest destination page loaded');
	this.load();
    }

    load() {
	var t = this
	getAllDestinations().then(function(results){
	    t.setState({ destinations: results });
	})

    }

    publish(id) {
	var t = this; 
	updateDestination(id, { status: "published" }).then(function() {
	    t.load(); 
	})
    }

    unpublish(id) {
	var t = this; 
	updateDestination(id, { status: "submitted" }).then(function() {
	    t.load.bind(t)(); 
	})
    }
    
    render() {

	var t = this;

	var rows =
	    this.state.destinations.map(function(destination, i){

		var reviews = destination.result.reviewers.map(function(reviewer, j){
		    return (<div className="reviewer" key={ j }>
			<div>
			{ reviewer.email }
		    </div>
			<div>
			{ reviewer.review }
			</div>
			    </div>);

		})

		var controls;

		if (destination.result.status == "submitted") {

		    controls = <div>
			<button className="btn btn-primary" onClick={t.publish.bind(t, destination.id)}>Publish</button>
		    </div>;

		}

		if (destination.result.status == "published") {

		    controls = <div>
			<button className="btn btn-primary" onClick={t.unpublish.bind(t, destination.id)}>Unpublish</button>
		    </div>;

		}
		    
		return (<div className="row" key={ i }>
			<div className="col-12">
			<div className="card">
			   <h5 className="card-header">{ destination.result.airfield_name } </h5>
			   <div className="card-body">
			      <h5 className="card-title">{ destination.result.name }</h5>
			      { reviews }
                        { controls }
                          </div>
                        </div>

			
		
			</div>
			</div>); 
	    })
       
    return (
        <div className="review-destinations-page">

	<div className="container">
	    { rows }
	    </div>

	</div>); 

    }
    
}

ReviewDestinations.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
