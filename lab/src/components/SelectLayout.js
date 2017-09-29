'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import fetch from 'isomorphic-fetch';

import { savePanel, listLayouts } from './../apiClient.js';

export default class SelectLayout extends React.Component {

    componentDidMount() {
	var this_ = this;
	this.context.mixpanel.track('select layout page loaded');
	listLayouts('*').then(function(response) {
	    console.log('got layouts ' + response)
	    this_.setState({ layouts: response })
	})
    }

    gotoPanel(id) {
	this.context.history.push("/panel/"+id);
    }

    createNewPanel(layout) {
	var t = this;
	savePanel({ layout: layout }).then(function(response) {
	    t.context.cookies.set('panelId', response.id)
	    t.gotoPanel.bind(t)(response.id)
	})   
    }

    missingLayout() {
	this.props.messageTeam("missinglayout")
    }

    selectLayout(id) {
	this.createNewPanel(id)
    }

    
    render() {

	var this_ = this
	
	var layouts = <p></p>;
	
	if (this.state && this.state.layouts) {
	    layouts = this.state.layouts.map(function(layout, i) {
		return <button type="button" key={ i } onClick={ () => this_.selectLayout.bind(this_)(layout.id) } className="btn btn-primary">
                    { layout.name }
		</button>
		    
	    })
	}
	   
	
	return (

		<div className="select-layout">

		   <div className="container">

	  	     <div className="row">

                       <div className="col-12">

	    	         <div className="card existing-layouts">
  
		<div className="card-block">
		<h4 className="card-title">Select your aircraft</h4>
		<p className="card-text">External contributors measured panels and produced accurate CAD layouts for several airframes already.</p>
     	        { layouts }
		<button type="button" onClick={this.missingLayout.bind(this)} className="btn btn-warning">Another airframe</button>
	        </div>
	                 </div>
		
	
	             </div>

	          </div>
	

	        </div>

	   
	        </div>
	)
	
    }

}


SelectLayout.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};

