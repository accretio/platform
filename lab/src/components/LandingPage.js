'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import fetch from 'isomorphic-fetch';

import { CookiesProvider, withCookies, Cookies } from 'react-cookie';

import { autocompleteAirfields, runSearchAroundAirfield } from './../apiClient.js';

import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';

const AsyncTypeahead = asyncContainer(Typeahead);


export default class LandingPage extends React.Component {
    
    constructor(props) {
	super(props);
	this.state = {
	    allowNew: false,
	    isLoading: false,
	    multiple: false,
	    options: [],
	    results: [],
	    fullJumbotron: true
	};
    }

    componentDidMount() {
        this.context.mixpanel.track('landing page loaded');
	 window.scrollTo(0, 0)
    }

    gotoPanel(id) {
	this.context.history.push("/panel/"+id);
    }
    
    createNewPanel() {
	this.context.history.push("/layout");
    }
    
    retrievePanel() {
	var id = this.panelIdInput.value;
	this.gotoPanel.bind(this)(id)
    }

    runSearchAroundHomebase() {
	var homebase = this.homebaseInput.value; 
    }


     searchAirfields(query) {
	var t = this
	this.setState({isLoading: true});
   
	console.log("running typeahead search for query " + query)
	autocompleteAirfields(query).then(function(hits) {
	    t.setState({
		isLoading: false,
		options: hits,
	    })
	})
     }
    
    _handleChange(e) {
	var t = this
	if (e.length > 0) {
	    runSearchAroundAirfield(e[0].id).then(function(results) {
		t.setState({ fullJumbotron: false, results: results });
	    })
	} else {
	    t.setState({ fullJumbotron: false, results: [] });
	}
    }
    
    render() {

	var t = this;

		let airfieldTypeahead = <AsyncTypeahead
	labelKey="name"
	isLoading={this.state.isLoading}
	onSearch={this.searchAirfields.bind(this)}
	options={this.state.options}
	placeholder="Your homebase?"
	onChange={this._handleChange.bind(this)}
/>;

    var searchBox =  <div className="search-box row">
             
	    <div className="col">
	    { airfieldTypeahead }
	      </div>
	    
	   
            </div> ; 

	var header;

	if (this.state.fullJumbotron) {
		header = <div><h1 className="display-4">Where are you having lunch today?</h1>

	    <p className="lead">Locate on-airfield restaurants within reach. Read reviews. Go fly!</p>

	    <hr className="my-4" />
		</div>;
	}


	var results = this.state.results.map(function(r, i){
	    var result = r.result
	    console.log(result)
	    return (<div className="card bg-light" key = { i }>
		    <div className="card-header">
		    { result.airfield_name }, { r.distance } miles away
		    </div>
  <div className="card-body">
		    <h5 className="card-title"> { result.name } </h5>
		    <p className="card-text">{ result.opinion } </p>

		    </div>

		   
</div>);
	    
	})
	
	return (
		<div className="landing-page">
		
		<div className="jumbotron">
		{ header }
	        { searchBox }
            </div>
	
	        <div className="card-columns">
		{ results }
	    </div>
	
		
     </div>
         
     
    );

  }
}

LandingPage.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
