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
	};
    }

    componentDidMount() {
        this.context.mixpanel.track('landing page loaded');
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
	runSearchAroundAirfield(e[0].id).then(function(results) {
	    this.setState({ results: results });
	})
    }
    
    render() {

	var t = this;

		let airfieldTypeahead = <AsyncTypeahead
	labelKey="name"
	isLoading={this.state.isLoading}
	onSearch={this.searchAirfields.bind(this)}
	options={this.state.options}
	onChange={this._handleChange.bind(this)}
/>;

    var searchBox =  <div className="search-box row">
              <div className="col-auto label">
 	        <label className="" htmlFor="inlineFormInputName2">Where are you based?</label>
	      </div>
	    <div className="col-3">
	    { airfieldTypeahead }
	      </div>
	    
	      <div className="col-3">
	       <button type="submit" className="btn btn-primary mb-2">Search</button>
	     </div>

            </div> ; 

	var header;

	if (this.state.options.length ==0) {
		header = <div><h1 className="display-4">Where are you having lunch today?</h1>

	    <p className="lead">Locate on-airfield restaurants within reach. Read reviews. Go fly!</p>

	    <hr className="my-4" />
		</div>;
	}
	
	return (
		<div className="landing-page">
		
		<div className="jumbotron">
		{ header }
	        { searchBox }
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
