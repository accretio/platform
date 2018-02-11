'use strict';

import React, { PropTypes} from 'react';


import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';

import { WithContext as ReactTags } from 'react-tag-input';

const AsyncTypeahead = asyncContainer(Typeahead);

import { autocompleteAirfields, saveProfile } from './../apiClient.js';

export default class TripSuggester extends React.Component {

    constructor(props) {
	super(props)
	this.state = {
	    thankYou: false,
	    error: null,
	    allowNew: false,
	    multiple: false,
	};
	
	this.inputs = {};
	this.state[ this._airfieldPropertyName('baseAirfield') ] = { isLoading: false, options: [] };

	// couple of constants
	this._baseAirfield = "baseAirfield"
	this._contributorEmail = "contributorEmail"
	this._contributorName = "contributorName"
    }
    
    componentDidMount() {
        this.context.mixpanel.track('trip suggester page loaded');
    }

    _sendError(error) {
	this.props.sendError(error)
    }

    _searchAirfields(name, query) {
	var t = this
	
	this.setState({ [ t._airfieldPropertyName(name) ] : { isLoading: true, options: this.state[ t._airfieldPropertyName(name) ].options } });
   	console.log("running typeahead search for query " + query)
	autocompleteAirfields(query).then(function(hits) {
	    console.log('got hits ' + hits.length);
	    t.setState({ [ t._airfieldPropertyName(name) ] : { isLoading: false, options: hits } });
	})
	
    }

    _airfieldPropertyName(name) {
	return ('airfieldAutocomplete'+name) ;
    }

    _handleChange(name, e) {
	this.setState({ [ name ]: e[0] })
    }

    _createAirfieldInput(name, label) {
	var id = name + '-name-input'
	var statePropertyName = this._airfieldPropertyName(name);
	
	let airfieldTypeahead = <AsyncTypeahead
	labelKey= "name"
	isLoading={this.state[ statePropertyName ].isLoading}
	onSearch={this._searchAirfields.bind(this, name)}
	options={this.state[ statePropertyName ].options}
	onChange={this._handleChange.bind(this, name)}
	/>;

	return(<div className="form-group row">
	          <label htmlFor={ id } className="col-sm-4 col-form-label hidden-xs"> { label } </label>
	          <div className="col-8">
	             { airfieldTypeahead }
	          </div>
	       </div>);
    }

    _createInput(name, label, type="text") {
	var id = name + '-name-input'
	return(<div className="form-group row">
	          <label htmlFor={ id } className="col-sm-4 col-form-label hidden-xs"> { label } </label>
	          <div className="col-8">
	       <input className="form-control" type= { type } id= { id } ref={el => this.inputs[name] = el } />
	          </div>
	       </div>);
    }

    _createCheck(value) {
	var id = value + '-name-check'
	return(<div className="form-check form-check-inline">
	       <input className="form-check-input" type="checkbox" id= { id } value= { value } ref={el => this.inputs[value] = el } />
	       <label className="form-check-label" htmlFor={ id } > { value } </label>
	       </div>)
	
    }

    _createTextarea(name, label) {
	var id = name + '-name-input'
	return(<div className="form-group row">
	          <label htmlFor={ id } className="col-sm-4 col-form-label hidden-xs"> { label } </label>
	          <div className="col-8">
	             <textarea className="form-control" rows="3" id= { id } ref={el => this.inputs[name] = el } />
	          </div>
	       </div>);
    }

     _createDatepicker(name, label) {
	var id = name + '-name-input'
	return(<div className="form-group row">
	          <label htmlFor={ id } className="col-sm-4 col-form-label hidden-xs"> { label } </label>
	          <div className="col-8">
	        <input className="form-control" type="date" id= { id } ref={el => this.inputs[name] = el } />
	          </div>
	       </div>);
    }


    _shareExperience() {

	var t = this
	
	if (!this.state[this._baseAirfield]) {
	    this.context.mixpanel.track('trip suggester validation warning', { message: 'missing base airfield' });
	    this._sendError("Where are you based?")
	    return;
	}
	
	if (this.inputs[this._contributorEmail].value == '') {
	    this._sendError("Please leave your email so that we can get in touch. It won't be displayed")
	    this.context.mixpanel.track('trip suggester validation warning', { message: 'no email' });
	    return;
	}

	// this is best effort 
	this.context.mixpanel.register({
	    'Email': this.inputs[this._contributorEmail].value,
	    'Name': this.inputs[this._contributorName].value
	});

	// this should be done behind a login, but for now it is enough
	this.context.mixpanel.identify(this.inputs[this._contributorEmail].value);
	this.context.mixpanel.people.set({
	    "$email":  this.inputs[this._contributorEmail].value,   
            "$last_login": new Date(),         
    	    "$name" : this.inputs[this._contributorName].value
	});

	var profile = {
	    base: this.state[this._baseAirfield],
	    availabilities : [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ].map(function(day) { return { day: day, isAvailable: t.inputs[day].checked }; }),
			       
	    name: this.inputs[this._contributorName].value,
	    email: this.inputs[this._contributorEmail].value,
	}

	console.log(profile) 
	this.context.mixpanel.track('submitting new profile', profile);
	 
	saveProfile(profile).then(function(body) {
	    t.context.mixpanel.track('new profile', { id: body.id });
	    t.props.setYesNo("Thank You", "Thanks, we will be in touch!",
			     function() {
				 t.context.history.push("/")
			     }, null)
	}, function(error) {
	    t.context.mixpanel.track('error in share experience page', { 'error': error });
	    t._sendError("Sorry, something went wrong");
	})



    }
    
    render() {
	var t = this;

	let submitGroup =
	    <div className="submit-group row text-center">
	    <div className="col-12">
	       <button type="submit" className="btn btn-primary" onClick={t._shareExperience.bind(t)}>Submit</button>
	    </div>
	    </div>

	let availabilityGroup =
	      <div className="form-group row">
	          <label htmlFor="experienceId" className="col-sm-4 col-form-label hidden-xs"> When are you usually available? </label>
	          <div className="col-8">

	{ t._createCheck("Monday") }
	{ t._createCheck("Tuesday") }
	{ t._createCheck("Wednesday") }
	{ t._createCheck("Thursday") }
	{ t._createCheck("Friday") }
	{ t._createCheck("Saturday") }
	{ t._createCheck("Sunday") }
	   
	          </div>
	    </div>
  
	return (

	    <div className="trip-suggester-page">

	    	<div className="container">

		   <div className="title row text-center">
	              <div className="col-12">
	                  <h2>Trip Suggester</h2>
	              </div>
	        </div>

	       <div className="explanation row">
	              <div className="col-12">
	                <div className="card">
		<div className="card-body">
		Fill up the form below and we will send you and other pilots around you trips suggestions. If several pilots are up for the same trip on the same day, we will make it happen!
	     </div>
</div>
	              </div>
	        </div>

	    

	    

	    { t._createAirfieldInput(t._baseAirfield, "Where are you based?") }
	    
	    { availabilityGroup }
	    
	    { t._createInput(t._contributorEmail, "Your email (hidden)", "email") }

	    { t._createInput(t._contributorName, "Your name (optional)") }

	    { submitGroup }
	
	    </div>
           	        
	  </div>
	    
	); 
    }

}



TripSuggester.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
