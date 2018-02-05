'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import fetch from 'isomorphic-fetch';

import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';

const AsyncTypeahead = asyncContainer(Typeahead);

import { CookiesProvider, withCookies, Cookies } from 'react-cookie';

import { saveAirfield, autocompleteAirfields } from './../apiClient.js';

import Modal from 'react-modal';

export default class ManageAirfields extends React.Component {

    constructor(props) {
	super(props);
	this.state = {
	    thankYou: false,
	    error: null,
	    allowNew: false,
	    isLoading: false,
	    multiple: false,
	    options: [],
	};
    }

    componentDidMount() {
        this.context.mixpanel.track('manage airfield page loaded');
    }

    quit() {
	this.context.history.push("/");
    }

    resetError() {
	this.setState({ thankYou: false, error: null });
    }
    
    reset() {
  }
    
    createAirfield() {

	var t = this

	var airfieldName = this.airfieldNameInput.value;
	var airfieldIdentifier = this.airfieldIdentifierInput.value;
	var airfieldLat = this.airfieldLatInput.value;
	var airfieldLon = this.airfieldLonInput.value
	
	if (airfieldName == '') {
	    this.setState({ error: 'Please enter the name of the airfield' })
	    return;
	}
		
	if (airfieldIdentifier == '') {
	    this.setState({ error: 'Please enter the identifier of the airfield' })
	    return;
	}

		
	if (airfieldLat == '') {
	    this.setState({ error: 'Please enter the latitude of the airfield' })
	    return;
	}

		
	if (airfieldLon == '') {
	    this.setState({ error: 'Please enter the longitude of the airfield' })
	    return;
	}
	

	var airfield = {
	    identifier: airfieldIdentifier,
	    name: airfieldName,
	    location: {
		lat: airfieldLat,
		lon: airfieldLon
	    }
	   
	}

	console.log("airfield is " + airfield)
	
	saveAirfield(airfield).then(function(response) {
	    alert("Thanks")
	}, function(error) {
	    t.context.mixpanel.track('error in airfield page', { 'error': error });
	    alert("Sorry, something went wrong");
	})

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
	console.log(e);
	this.setState({
	    airfield: e[0]
	})
    }
    
    render() {

	var t = this;

	
	const modalCustomStyles = {
            overlay : {
                position          : 'fixed',
                top               : 0,
                left              : 0,
                right             : 0,
                bottom            : 0,
                backgroundColor   : 'rgba(255, 255, 255, 0.75)'
            },
            content : {
                position                   : 'absolute',
                top                        : '40px',
                left                       : '40px',
                right                      : '40px',
                bottom                     : '40px',
                border                     : 'none',
                background                 : '',
                overflow                   : 'auto',
                WebkitOverflowScrolling    : 'touch',
                borderRadius               : '4px',
                outline                    : 'none',
                padding                    : '20px'

            }
         } ;

	let errorModal =
            <Modal isOpen={this.state.error != null }
	className=""
	style={modalCustomStyles}
        contentLabel="Thank You">

            <div className="modal-dialog" role="document">
            <div className="modal-content">
            <div className="modal-header">
            <h5 className="modal-title">Error</h5>
           
             </div>
            <div className="modal-body">
            <p>{ this.state.error } </p>
            </div>
            <div className="modal-footer">
         
	    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.resetError.bind(this)}>Ok</button>
      
	</div>
            </div>
            </div>

        </Modal> ;

	let airfieldTypeahead = <AsyncTypeahead
	labelKey="name"
	isLoading={this.state.isLoading}
	onSearch={this.searchAirfields.bind(this)}
	options={this.state.options}
	onChange={this._handleChange.bind(this)}
/>;
	
       
	return (
		<div className="manage-airfields-page">
        	{ errorModal }

		<div className="container">
		
		<div className="title row text-center">
		<div className="col-12">
		<h2>Add an airfeld</h2>
		</div>
		</div>
	    
	<div>

		<div className="form-group row">
		<label htmlFor="airfield-input" className="col-sm-2 col-form-label hidden-xs">Airfield name</label>
		<div className="col-10">
		<input className="form-control" type="text" id="airfield-input" ref={el => this.airfieldNameInput = el} />
		</div>
		</div>

	    	<div className="form-group row">
		<label htmlFor="airfield-identifier" className="col-sm-2 col-form-label hidden-xs">Airfield identifier</label>
		<div className="col-10">
		<input className="form-control" type="text" id="airfield-identifier" ref={el => this.airfieldIdentifierInput = el} />
		</div>
		</div>

	    	<div className="form-group row">
		<label htmlFor="airfield-lat" className="col-sm-2 col-form-label hidden-xs">Airfield latitude</label>
		<div className="col-10">
		<input className="form-control" type="text" id="airfield-lat" ref={el => this.airfieldLatInput = el} />
		</div>
		</div>

	    	<div className="form-group row">
		<label htmlFor="airfield-lon" className="col-sm-2 col-form-label hidden-xs">Airfield longitude</label>
		<div className="col-10">
		<input className="form-control" type="text" id="airfield-lon" ref={el => this.airfieldLonInput = el} />
		</div>
		</div>

	    <div className="submit-group row text-center">
	    <div className="col-12">
	    <button type="submit" className="btn btn-primary" onClick={t.createAirfield.bind(t)}>Create</button>
</div>
	</div>
	</div>
	</div>
	</div>
         
     
    );
  }
}

ManageAirfields.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
