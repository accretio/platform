'use strict';

import React, { PropTypes} from 'react';

import { getExperience, getTrip } from './../apiClient.js';

import { EditorState, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';

import { saveExperienceDescription } from './../apiClient.js';

export default class Experience extends React.Component {

    constructor(props) {
	super(props);
 	console.log(this.props.params);
	console.log("LANG>>> " + this.props.language);
	this.state = {
	    experience: null,
	    editable: (this.props.params.edit ? true : false),
	    editorState: EditorState.createEmpty()
	}
	
    }
    
    componentDidMount() {

	var this_ = this;
	const { t, i18n } = this.props;

	var edit = ""
	if (this.props.params.edit) {
	    edit = "/edit"
	}
	if (this.props.params.language != i18n.language) {
	    this.context.history.push("/experience/" + this.props.params.id + '/' + i18n.language + edit)
	    this.props.params.language = i18n.language
	} 

	this.context.mixpanel.track("loading experience page", { id: this.props.params.id })
	this._loadExperience()

	i18n.on('languageChanged', function(lng) {
	    if (this_.props.params.language != i18n.language) {
		
		var edit = ""
		if (this_.props.params.edit) {
		    edit = "/edit"
		}
		this_.context.history.push("/experience/" + this_.props.params.id + '/' + i18n.language + edit)
		this_.props.params.language = i18n.language
		this_._loadExperience()
	    } 
	});
	
    }
   
    _loadExperience() {
	

	var t = this
	let id = this.props.params.id
	var language = 'en'
	if (this.props.params.language) {
	    language = this.props.params.language
	}

	console.log(this.props.params)
	
	getExperience(id, language).then(function(experience){
	    console.log(experience)
	    var contentState = convertFromRaw(experience.descriptionDraftJs)
	    var editorState = EditorState.createWithContent(contentState)
	    t.setState({ experience, editorState })
	}, function() {
	    t.props.sendError("This experience does not exist", function() {
		t.context.history.push("/")
	    })
	})
    }

    _onEditorStateChange(editorState) {
	this.setState({
	    editorState,
	});
    }

    _formatAirfield(airfield, i) {

	return <div className="card" key={i}>
	    <div className="card-header"> { airfield.identifier } </div>
	    
	    <div className="card-body">
	    <h5 className="card-title"> { airfield.name } </h5>
	    <p className="card-text"></p>
	    </div>
	    
	    </div>
    }

    _saveExperience() {
	var t = this
	var descriptionContent = this.state.editorState.getCurrentContent()
	var descriptionDraftJs = convertToRaw(descriptionContent)
	var descriptionPlainText = descriptionContent.getPlainText()


	var language = 'en'
	if (this.props.params.language) {
	    language = this.props.params.language;
	}
	
	console.log(descriptionPlainText)
	console.log(descriptionDraftJs)
	saveExperienceDescription(this.props.params.id,
				  language,
				  descriptionDraftJs,
				  descriptionPlainText).then(function() {

				  }, function() {
				      t.props.sendError("Couldn't save experience")
				  })
	
    }
    
    render() {

	const { t, i18n } = this.props;

	var this_ = this
	
	var experience = this.state.experience

	if (!experience) {
	    return null; 
	}


	var title = <div className="row title text-center">
	    <div className="col-12">
	    <h1>{ t(experience.title) }</h1>
	    </div>
	    </div>

	var trips = 
		<div className="row trips">
	    <div className="col-12">
	    <div className="alert alert-success" role="alert">
	    { experience.trips.length } { (experience.trips.length > 2) ? (t("people")): (t("person")) } { t("lived that experience") }
	    </div>
	</div>
	    </div>

	var airfields = new Array()

	experience.trips.map(function(trip) {
	    if (airfields.indexOf(trip.destinationAirfield) == -1) {
		airfields.push(trip.destinationAirfield)
	    }
	})
	
/*	var airfieldsOfEntry = 
	    <div className="row">
	    <div className="card-deck">
	    { airfields.map(t._formatAirfield.bind(t)) }
	    </div>
	    </div>
*/

	var airfieldsOfEntry =
	    <div className="row airfield text-center">
	    <div className="col-12">
	    { airfields[0].name } - { airfields[0].identifier }
	    </div>
	    </div>


	var classNameEditor;
	if (this.state.editable == false) {
	    classNameEditor = "hide-toolbox";
	}

	var saveButton;

	if (this.state.editable == true) {
	    saveButton =
		<div className="row text-center">
		<div className="col-12 ">
		<button className="btn btn-info" onClick = { this._saveExperience.bind(this) } >
		Save
	    </button>
	        </div>
		</div>
	}
	
	var description =
	    <div className="row">
	    <div className= { "col-12 " + classNameEditor }>
	    <Editor editorState={this.state.editorState} onEditorStateChange={this._onEditorStateChange.bind(this)} readOnly= { !this.state.editable } />
	    </div>
	    </div>

	return (<div className="experience-page">
		<div className="container">

		{ title }
		{ airfieldsOfEntry }
		{ trips }
		{ description }
		{ saveButton }
		
		</div>
		</div>);
	
    }

};


Experience.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
