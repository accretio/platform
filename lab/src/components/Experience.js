'use strict';

import React, { PropTypes} from 'react';

import { getExperience, getTrip } from './../apiClient.js';


export default class Experience extends React.Component {

    constructor(props) {
	super(props);
	this.state = {
	    experience: null
	}
    }
    
    componentDidMount() {
	this.context.mixpanel.track("loading experience page", { id: this.props.params.id })

	this._loadExperience()
    }

    _loadExperience() {
	var t = this
	let id = this.props.params.id
	getExperience(id).then(function(experience){
	    console.log(experience)
	    t.setState(experience)
	}, function() {
	    t.props.sendError("This experience does not exist", function() {
		t.context.history.push("/")
	    })
	})
    }
    
    render() {

	if (!this.state.experience) {
	    return null; 
	}
	
	return (<div className="experience-page">
		hello
		</div>);
	
    }

}




Experience.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
