'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import fetch from 'isomorphic-fetch';

import { CookiesProvider, withCookies, Cookies } from 'react-cookie';

import { savePanel } from './../apiClient.js';

export default class SuggestDestination extends React.Component {

    componentDidMount() {
        this.context.mixpanel.track('suggest destination page loaded');
    }

    suggestRestaurant() {

	var airfield = this.airfieldInput.value;
	var restaurantName = this.restaurantNameInput.value;
	var review = this.reviewInput.value;
	var reviewerEmail = this.reviewerEmailInput.value

	alert(airfield + " " + restaurantName + " " + review + " " + reviewerEmail);
	
    }

    render() {

	var t = this;
	
    return (
        <div className="suggest-destination-page">

	<div className="container">

	    <div className="title row text-center">
	    <div className="col-12">
	    <h2>Suggest a restaurant</h2>
	    </div>
	    </div>
	    
	<form>

	    <div className="form-group row">
	    <label htmlFor="airfield-input" className="col-2 col-form-label">Airfield identifier</label>
	    <div className="col-10">
	    <input className="form-control" type="text" id="airfield-input" ref={el => this.airfieldInput = el} />
	    </div>
	    </div>
	    
	    <div className="form-group row">
	    <label htmlFor="restaurant-name-input" className="col-2 col-form-label">Name of the restaurant</label>
	    <div className="col-10">
	    <input className="form-control" type="text" id="restaurant-name-input" ref={el => this.restaurantNameInput = el} />
	    </div>
	    </div>

	    <div className="form-group row">
	    <label htmlFor="review-input" className="col-2 col-form-label">Your review</label>
	    <div className="col-10">
	    <textarea className="form-control" id="review-input" rows="3" ref={el => this.reviewInput = el} ></textarea>
	    </div>
	    </div>

	    <div className="form-group row">
	    <label htmlFor="reviewer-email-input" className="col-2 col-form-label">Your email (private)</label>
	    <div className="col-10">
	    <input className="form-control" type="text" id="reviewer-email-input"  ref={el => this.reviewerEmailInput = el} />
	    </div>
	    </div>

	    <div className="submit-group row text-center">
	    <div className="col-12">
	    <button type="submit" className="btn btn-primary" onClick={t.suggestRestaurant.bind(t)}>Submit</button>
</div>
	</div>
	</form>
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
