'use strict';

import React, { PropTypes} from 'react';

import { getAllExperiences, updateExperience } from './../apiClient.js';


export default class ListExperiences extends React.Component {

    constructor(props) {
	super(props);
	this.state = {
	    experiences: []
	}
    }
    
    componentDidMount() {
	this.context.mixpanel.track("loading admin experiences page")
	this._loadExperiences()
    }

    _loadExperiences() {
	var t = this
	getAllExperiences().then(function(experiences){
	    t.setState({ experiences: experiences })
	}, function() {
	    t.props.sendError("Couldn't load experiences", function() {
		t.context.history.push("/")
	    })
	})
    }

    _gotoExperience(id) {
	this.context.history.push("/experience/"+id)
    }

    _updateStatus(experience, status) {
	var t = this 
	var doc = experience.result
	var id = experience.id
	doc.status = status
	updateExperience(id, doc).then(function(body) {

	    var newExperiences =
		t.state.experiences.map(function(e) {
		    if (e.id == experience.id) {
			var ne = Object.assign({}, e);
			ne.status = status
			return ne; 
		    } else {
			return e
		    }
		})
	    t.setState({ experiences: newExperiences })
	}, function() {
	    t.props.sendError("Couldn't update the experience")
	})
    }

    _mailTo(email) {
	console.log(email)
	window.location = "mailto:"+email
    }
    
    _formatExperience(experience, i) {

	var statusBtn;

	if (experience.result.status == "published") {
	    statusBtn = <button
	    className="btn btn-danger"
	    onClick = { this._updateStatus.bind(this, experience, "unpublished") }>
		Unpublish
	    </button>
	} else {
	    statusBtn = <button
	    className="btn btn-success"
	    onClick = { this._updateStatus.bind(this, experience, "published") }
		>
		Publish
	    </button>
	}

	var emailBtn = <span
	    className="">
	    { experience.result.authors[0].email }
	    </span>
	    
	return(<div className="row experience" key = { i } >


	        <div className="col-3">
	          { experience.result.title }
	       </div>

	         <div className="col-2">
	          { experience.result.status }
	       </div>
	       
	       <div className="col-2">
	       { statusBtn }
	       </div>

	       <div className="col-1">
	       <button className="btn btn-primary" onClick = { this._gotoExperience.bind(this, experience.id) }>
	       Open
	       </button>
	      
	       </div>

	          <div className="col-2">
	       { emailBtn }
	       </div>

	       
	       </div>)

    }
    
    render() {

	var experiences =
	    this.state.experiences.map(this._formatExperience.bind(this))
	
	return (<div className="list-experiences-page">
		<div className="container">
		<div className="row title text-center">
		<div className="col-12">
		<h1>Experiences</h1>
		</div>
		</div>
		{ experiences }
		</div>
		</div>);
	
    }

}




ListExperiences.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
