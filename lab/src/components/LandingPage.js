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
	var t = this;
	savePanel({}).then(function(response) {
	    t.context.cookies.set('panelId', response.id)
	    t.gotoPanel.bind(t)(response.id)
	})
        
    }
    
    retrievePanel() {
	var id = this.panelIdInput.value;
	this.gotoPanel.bind(this)(id)
    }
    
    render() {

	var t = this;
	
    return (
        <div className="landing-page">

            <div className="jumbotron">

	    <h1 className="display-4">Want a new panel?</h1>

	    <p className="lead">Position your avionics on a mock panel. Receive a plywood prototype. Order the final cut to your exact specifications.</p>

	    <hr className="my-4" />
            
            <p className="lead">

	    <span className="get-started">
	    <a className="btn btn-primary btn-lg" href="#" role="button"
	       onClick={t.createNewPanel.bind(t)} >Create New Panel</a>
	    </span>
	    <span className="separator" />
	    <span>
	    <input type="text" value={this.context.cookies.get('panelId')} ref={el => this.panelIdInput = el} className="panel-id" />
	    <a className="btn btn-primary btn-lg" href="#" role="button"
	       onClick={t.retrievePanel.bind(t)}>Retrieve Panel</a>
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
