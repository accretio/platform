'use strict';

import React, { PropTypes} from 'react';

import { getExperience, getTrip } from './../apiClient.js';

import { EditorState, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import { WithContext as ReactTags } from 'react-tag-input';

import { saveExperienceDescription, uploadImage } from './../apiClient.js';
import ImageUploader from 'react-images-upload';

import ExperienceFeedMenu from './ExperienceFeedMenu.js';

export default class Experience extends React.Component {

    constructor(props) {
	super(props);
 	console.log(this.props.params);
	console.log("LANG>>> " + this.props.language);
	this.state = {
	    experience: null,
	    editable: (this.props.params.edit ? true : false),
	    editorState: EditorState.createEmpty(),
	    files: [],
	    tags: []
	}
	this.handleDelete = this.handleDelete.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
        this.handleDrag = this.handleDrag.bind(this);

	
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
	    t.setState({ experience, editorState, tags: experience.tags.map(function(tag, i) { return { id: i, text: tag}}) })
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
	var this_ = this
	var descriptionContent = this.state.editorState.getCurrentContent()
	var descriptionDraftJs = convertToRaw(descriptionContent)
	var descriptionPlainText = descriptionContent.getPlainText()


	var language = 'en'
	if (this.props.params.language) {
	    language = this.props.params.language;
	}
	
	console.log(descriptionPlainText)
	console.log(descriptionDraftJs)

	// then we need to send the files one by one
	
	var filesPromises = this.state.files.map(function(fileList) {

	    const files = [...fileList]
	    return Promise.all(files.map(function(file) {

	    return (uploadImage(file).then(function(response) {
		console.log(">>> RESPONSE")
		var imageUrl = response.imageUrl
		return imageUrl
	    }))
		
	    }))
	    
	})

	Promise.all(filesPromises).then(function(allFilesUrls) {
	    console.log("allFilesUrls")
	    console.log(allFilesUrls)
	    var allUrls = [].concat.apply([], allFilesUrls);
	    var tags = this_.state.tags.map(function(t){ return t.text })
	    return saveExperienceDescription(this_.props.params.id,
					     language,
					     descriptionDraftJs,
					     descriptionPlainText, allUrls, tags)

	}).then(function() {

	}, function(err) {
	    console.log(err)
	    this_.props.sendError("Couldn't save experience")
	})
		
    }

    _onDrop(picture) {
	console.log(picture)
	this.setState({
            files: this.state.files.concat(picture),
        });
    }

    _onDelete(picture) {
	// todo: this doesn't work
	console.log(picture)
    }

    handleDelete(i) {
        let tags = this.state.tags;
        tags.splice(i, 1);
        this.setState({tags: tags});
    }
 
    handleAddition(tag) {
        let tags = this.state.tags;
        tags.push({
            id: tags.length + 1,
            text: tag
        });
        this.setState({tags: tags});
    }
 
    handleDrag(tag, currPos, newPos) {
        let tags = this.state.tags;
 
        // mutate array
        tags.splice(currPos, 1);
        tags.splice(newPos, 0, tag);
 
        // re-render
        this.setState({ tags: tags });
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

	var people = []
	experience.trips.map(function(trip) {
	    trip.crew.map(function(member) {
		if (people.indexOf(member.email) == -1) {
		    people.push(member.email)
		}
	    })
	})
	
	var trips = 
		<div className="row trips">
	    <div className="col-12">
	    <div className="alert alert-success" role="alert">
	    { people.length } { (people.length > 2) ? (t("people lived that experience")): (t("person lived that experience")) }
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



	var imgUploader = null
	var tagsUpdater = null
	
	if (this.state.editable == true) {

	     imgUploader = <ImageUploader
                	withIcon={true}
                	buttonText='Choose images'
            onChange={this._onDrop.bind(this) }
	     onDelete={this._onDelete.bind(this) }
           
                	imgExtension={['.jpg', '.gif', '.png', '.gif']}
            maxFileSize={20971520}
	    withPreview={true}
	 
		/>

	let tags = this.state.tags ;
        let suggestions = [ "family-friendly", "sports", "museum", "landmark" ].map(function(s) { return (t(s)) })

	    tagsUpdater =   <div className="form-group row">
	         
	          <div className="col-12 tags-widget">

	    <ReactTags tags={tags}
	classNames={{
	    tag: 'btn btn-info',
	}}
        suggestions={suggestions}
	placeholder={ t('Add a new tag') }
            handleDelete={this.handleDelete}
                    handleAddition={this.handleAddition}
                    handleDrag={this.handleDrag} />
        
	          </div>
	    </div>;

	    

	}

	
	
	var description =
	    <div className="row">
	    <div className= { "col-12 " + classNameEditor }>
	    <Editor editorState={this.state.editorState} onEditorStateChange={this._onEditorStateChange.bind(this)} readOnly= { !this.state.editable } />
	    </div>
	    </div>


	var carrousel = null ;


	if (experience.imagesUrls && experience.imagesUrls.length > 0) {

	    var indicators =
		experience.imagesUrls.map(function(imageUrl, i) {

		    var className = ""
		    if (i == 0) {
			className = "active"
		    }
		    
		    return <li data-target="#carouselExampleIndicators"
		    key = { i }
		    data-slide-to="0"
		    className= { className } >
			</li>
			
		})

	    var images =
		experience.imagesUrls.map(function(imageUrl, i) {
		     var className = "carousel-item "
		    if (i == 0) {
			className = "carousel-item active"
		    }
		    return <div className= { className } key = { i } >
			<img className="d-block w-100" src= { imageUrl } alt="" />
			</div>
			
		})
	    
	    
		carrousel = <div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel">
		<ol className="carousel-indicators"> { indicators } </ol>
  <div className="carousel-inner">
		{ images }
  </div>
  <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
    <span className="sr-only">Previous</span>
  </a>
  <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
    <span className="carousel-control-next-icon" aria-hidden="true"></span>
    <span className="sr-only">Next</span>
  </a>
</div>

	}

	/* the feed */
	var feed = 
	    <ExperienceFeedMenu reloadExperience = { this._loadExperience.bind(this) } experience = { experience } destinationAirfield = { airfields[0] } { ...this.props} />;

	return (<div className="experience-page">
		<div className="container">

	
		{ title }
		{ airfieldsOfEntry }
	
		{ carrousel }
		{ trips }
		{ description }
		{ imgUploader }
		{ tagsUpdater }
		{ saveButton }

		{ feed }
		
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
