'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import fetch from 'isomorphic-fetch';

import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';

const AsyncTypeahead = asyncContainer(Typeahead);

import { CookiesProvider, withCookies, Cookies } from 'react-cookie';

import { saveSuggestion, autocompleteAirfields } from './../apiClient.js';

import Modal from 'react-modal';

export default class SuggestDestination extends React.Component {

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
        this.context.mixpanel.track('suggest destination page loaded');
    }

    quit() {
	this.context.history.push("/");
    }

    resetError() {
	this.setState({ thankYou: false, error: null });
    }
    
    reset() {

	this.restaurantNameInput.value="";
	this.reviewInput.value="";
	this.reviewerEmailInput.value="";
	this.setState({ thankYou: false, error: null,  });
    }
    
    suggestRestaurant() {

	var t = this

	if (this.state.airfield == null) {
	    this.setState({ error: 'Please select an airfield' });
	    return;
	}
	
	var airfield = this.state.airfield.id
	var airfield_name = this.state.airfield.name

	var restaurantName = this.restaurantNameInput.value;

	if (restaurantName == '') {
	    this.setState({ error: 'Please enter the name of the restaurant' })
	    return;
	}
	
	var review = this.reviewInput.value;

	if (review == '') {
	    this.setState({ error: 'Please enter a review' })
	    return; 
	}
	
	var reviewerEmail = this.reviewerEmailInput.value

	var suggestion = {
	    airfield: airfield,
	    airfield_name: airfield_name,
	    restaurantName: restaurantName,
	    review: review,
	    reviewerEmail: reviewerEmail
	}

	console.log("suggestion is " + suggestion)
	
	saveSuggestion(suggestion).then(function(response) {
	    t.setState({ thankYou: true }); 
	}, function(error) {
	    t.context.mixpanel.track('error in suggestion page', { 'error': error });
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
	
	let thankYouModal =
            <Modal isOpen={this.state.thankYou}
	className=""
	style={modalCustomStyles}
        contentLabel="Thank You">

            <div className="modal-dialog" role="document">
            <div className="modal-content">
            <div className="modal-header">
            <h5 className="modal-title">Thank you</h5>
           
             </div>
            <div className="modal-body">
            <p>Your suggestion will be reviewed shortly. Would you like to make another one?</p>
            </div>
            <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.quit.bind(this)}>No</button>
	    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.reset.bind(this)}>Yes</button>
      
	</div>
            </div>
            </div>

        </Modal> ;

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
        <div className="suggest-destination-page">
	{ thankYouModal }
	{ errorModal }
	<div className="container">

	    <div className="title row text-center">
	    <div className="col-12">
	    <h2>Suggest a restaurant</h2>
	    </div>
	    </div>
	    
	<div>

    <div className="form-group row">
	    <label htmlFor="airfield-input" className="col-sm-2 col-form-label hidden-xs">Airfield identifier</label>
	    <div className="col-10">
	    	{ airfieldTypeahead }
	
	    </div>
	    </div>
	    
	    <div className="form-group row">
	    <label htmlFor="restaurant-name-input" className="col-sm-2 col-form-label hidden-xs">Name of the restaurant</label>
	    <div className="col-10">
	    <input className="form-control" type="text" id="restaurant-name-input" ref={el => this.restaurantNameInput = el} />
	    </div>
	    </div>

	    <div className="form-group row">
	    <label htmlFor="review-input" className="col-sm-2 col-form-label hidden-xs">Your review</label>
	    <div className="col-10">
	    <textarea className="form-control" id="review-input" rows="3" ref={el => this.reviewInput = el} ></textarea>
	    </div>
	    </div>

	    <div className="form-group row">
	    <label htmlFor="reviewer-email-input" className="col-sm-2 col-form-label hidden-xs">Your email (private)</label>
	    <div className="col-10">
	    <input className="form-control" type="text" id="reviewer-email-input"  ref={el => this.reviewerEmailInput = el} />
	    </div>
	    </div>

	    <div className="submit-group row text-center">
	    <div className="col-12">
	    <button type="submit" className="btn btn-primary" onClick={t.suggestRestaurant.bind(t)}>Submit</button>
</div>
	</div>
	</div>
	</div>
	</div>
         
     
    );
  }
}

SuggestDestination.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
