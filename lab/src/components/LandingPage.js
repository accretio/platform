'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import fetch from 'isomorphic-fetch';

import { CookiesProvider, withCookies, Cookies } from 'react-cookie';

import { savePanel } from './../apiClient.js';

export default class LandingPage extends React.Component {

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
    
    render() {

	var t = this;
	
    return (
        <div className="landing-page">

            <div className="jumbotron">

	    <h1 className="display-4">Where are you having lunch today?</h1>

	    <p className="lead">Locate on-airfield restaurants within reach. Read reviews. Go fly!</p>

	    <hr className="my-4" />
            
            <p className="lead">

	     <span className="search-homebase">
	    <input type="text" value={this.context.cookies.get('homebase')} ref={el => this.homebaseInput = el} className="homebase" />
	    <a className="btn btn-primary btn-lg" href="#" role="button"
	       onClick={t.runSearchAroundHomebase.bind(t)}>Search</a>
	    </span>
	
	    </p>

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
