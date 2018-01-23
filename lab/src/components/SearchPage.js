'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import fetch from 'isomorphic-fetch';

import { CookiesProvider, withCookies, Cookies } from 'react-cookie';

import { savePanel } from './../apiClient.js';

export default class SearchPage extends React.Component {

    componentDidMount() {
        this.context.mixpanel.track('search page loaded');
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
        <div className="search-page">

            <div className="jumbotron">

	

	    </div>
	</div>
         
     
    );
  }
}

SearchPage.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
