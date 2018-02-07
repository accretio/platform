'use strict';

import React, { PropTypes} from 'react';


import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';

import { WithContext as ReactTags } from 'react-tag-input';

const AsyncTypeahead = asyncContainer(Typeahead);

// see: https://github.com/AlastairTaft/draft-js-editor/
import { EditorState, ContentState, convertToRaw} from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';


//require('react-draft-wysiwyg/dist/react-draft-wysiwyg.css');


import { autocompleteAirfields, saveExperience } from './../apiClient.js';

export default class ShareExperience extends React.Component {

    constructor(props) {
	super(props)
	this.state = {
	    tags: [],
	    thankYou: false,
	    error: null,
	    allowNew: false,
	    multiple: false,
	    editorState: EditorState.createEmpty()
	};
	
	this.inputs = {};
	this.state[ this._airfieldPropertyName('departureAirfield') ] = { isLoading: false, options: [] };
	this.state[ this._airfieldPropertyName('destinationAirfield') ] = { isLoading: false, options: [] };

	// the tags callbacks
	this.handleDelete = this.handleDelete.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
        this.handleDrag = this.handleDrag.bind(this);

	// couple of constants
	this._departureAirfield = "departureAirfield"
	this._destinationAirfield = "destinationAirfield"
	this._tripDate = "tripDate"
	this._experienceTitle = "experienceTitle"
	this._contributorEmail = "contributorEmail"
	this._contributorName = "contributorName"
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
    
    componentDidMount() {
        this.context.mixpanel.track('share experience page loaded');
    }

    _sendError(error) {
	this.props.sendError(error)
    }

    _searchAirfields(name, query) {
	var t = this
	
	this.setState({ [ t._airfieldPropertyName(name) ] : { isLoading: true, options: this.state[ t._airfieldPropertyName(name) ].options } });
   	console.log("running typeahead search for query " + query)
	autocompleteAirfields(query).then(function(hits) {
	    console.log('got hits ' + hits.length);
	    t.setState({ [ t._airfieldPropertyName(name) ] : { isLoading: false, options: hits } });
	})
	
    }

    _airfieldPropertyName(name) {
	return ('airfieldAutocomplete'+name) ;
    }

    _handleChange(name, e) {
	this.setState({ [ name ]: e[0] })
    }

    _createAirfieldInput(name, label) {
	var id = name + '-name-input'
	var statePropertyName = this._airfieldPropertyName(name);
	
	let airfieldTypeahead = <AsyncTypeahead
	labelKey= "name"
	isLoading={this.state[ statePropertyName ].isLoading}
	onSearch={this._searchAirfields.bind(this, name)}
	options={this.state[ statePropertyName ].options}
	onChange={this._handleChange.bind(this, name)}
	/>;

	return(<div className="form-group row">
	          <label htmlFor={ id } className="col-sm-4 col-form-label hidden-xs"> { label } </label>
	          <div className="col-8">
	             { airfieldTypeahead }
	          </div>
	       </div>);
    }

    _createInput(name, label, type="text") {
	var id = name + '-name-input'
	return(<div className="form-group row">
	          <label htmlFor={ id } className="col-sm-4 col-form-label hidden-xs"> { label } </label>
	          <div className="col-8">
	       <input className="form-control" type= { type } id= { id } ref={el => this.inputs[name] = el } />
	          </div>
	       </div>);
    }

    _createTextarea(name, label) {
	var id = name + '-name-input'
	return(<div className="form-group row">
	          <label htmlFor={ id } className="col-sm-4 col-form-label hidden-xs"> { label } </label>
	          <div className="col-8">
	             <textarea className="form-control" rows="3" id= { id } ref={el => this.inputs[name] = el } />
	          </div>
	       </div>);
    }

     _createDatepicker(name, label) {
	var id = name + '-name-input'
	return(<div className="form-group row">
	          <label htmlFor={ id } className="col-sm-4 col-form-label hidden-xs"> { label } </label>
	          <div className="col-8">
	        <input className="form-control" type="date" id= { id } ref={el => this.inputs[name] = el } />
	          </div>
	       </div>);
    }

    _onChangeDescription(editorState) {
	this.setState({editorState})
    }
 
    _shareExperience() {

	var t = this
	var descriptionContent = this.state.editorState.getCurrentContent()
	var descriptionDraftJs = convertToRaw(descriptionContent)
	var descriptionPlainText = descriptionContent.getPlainText()
	
	if (!this.state[this._departureAirfield]) {
	    this._sendError("Where did you depart from?")
	    return;
	}

	if (!this.state[this._destinationAirfield]) {
	    this._sendError("Where did you go?")
	    return;
	}

	if (this.inputs[this._tripDate].value == '') {
	    this._sendError("When did you take this trip?")
	    return;
	}

	if (this.inputs[this._experienceTitle].value == '') {
	    this._sendError("What is the name of your experience?")
	    return;
	}
	
	if (this.state.tags.length == 0) {
	    this._sendError("Please add at least one tag so that others can find your writeup")
	    return;
	}
	
	if (this.inputs[this._contributorEmail].value == '') {
	    this._sendError("Please leave your email so that we can get in touch. It won't be displayed")
	    return;
	}

	var trip = {
	    departureAirfield: this.state[this._departureAirfield],
	    destinationAirfield: this.state[this._destinationAirfield],
	    date: this.inputs[this._tripDate].value,
	    crew: [
		{
		    name: this.inputs[this._contributorName].value,
		    email: this.inputs[this._contributorEmail].value,
		}
	    ]
	}
	
	var experience = {
	    title: this.inputs[this._experienceTitle].value,
	    descriptionDraftJs: descriptionDraftJs,
	    descriptionPlainText: descriptionPlainText, 
	    tags: this.state.tags.map(function(t){ return t.text }),
	    author: {
		name: this.inputs[this._contributorName].value,
		email: this.inputs[this._contributorEmail].value,
	    },
	    trip: trip
	}

	console.log(experience)

	saveExperience(experience).then(function() {
	    t.props.setYesNo("Thank You", "Do you want to share another experience?",
			     function() {
				 t._reset().bind(t)
			     },
			     function() {
				 t.context.history.push("/")
			     })
	}, function(error) {
	    t.context.mixpanel.track('error in share experience page', { 'error': error });
	    t._sendError("Sorry, something went wrong");
	})

    }

    _onEditorStateChange(editorState) {
	this.setState({
	    editorState,
	});
    }

    _reset() {
	const editorState = EditorState.push(this.state.editorState, ContentState.createFromText(''));
	this.inputs[this._tripDate].value = ''
	this.inputs[this._experienceTitle].value = ''
	this.setState({ editorState, tags: [] });
    }
    
    render() {
	var t = this;

	let tags = this.state.tags;
        let suggestions = [ "family-friendly", "sports", "museum", "landmark" ];

	let tagsInputGroup =
	    <div className="form-group row">
	          <label htmlFor="experienceId" className="col-sm-4 col-form-label hidden-xs"> Tags </label>
	          <div className="col-8 tags-widget">

	    <ReactTags tags={tags}
	classNames={{
	    tag: 'btn btn-info',
	}}
                    suggestions={suggestions}
                    handleDelete={this.handleDelete}
                    handleAddition={this.handleAddition}
                    handleDrag={this.handleDrag} />
        
	          </div>
	    </div>;

	let submitGroup =
	    <div className="submit-group row text-center">
	    <div className="col-12">
	       <button type="submit" className="btn btn-primary" onClick={t._shareExperience.bind(t)}>Submit</button>
	    </div>
	    </div>

	let descriptionGroup =
	      <div className="form-group row">
	          <label htmlFor="experienceId" className="col-sm-4 col-form-label hidden-xs"> Description of your experience </label>
	          <div className="col-8">

	    <Editor editorState={this.state.editorState} onEditorStateChange={this._onEditorStateChange.bind(this)}  />
	    </div>
	    </div>
  
	return (

	    <div className="share-experience-page">

	    	<div className="container">

		   <div className="title row text-center">
	              <div className="col-12">
	                  <h2>Share an experience</h2>
	              </div>
	        </div>

	    { t._createAirfieldInput(t._departureAirfield, "Where did you depart from?") }
	    
	    { t._createAirfieldInput(t._destinationAirfield, "Where did you land at?") } 

	    { t._createDatepicker(t._tripDate, "When did you take the trip?") }
   
	    { t._createInput(t._experienceTitle, "Title of your experience") }
	    
	    { descriptionGroup }
	    
	    { tagsInputGroup }
	    
	    { t._createInput(t._contributorEmail, "Your email (hidden)", "email") }

	    { t._createInput(t._contributorName, "Your name (optional)") }

	    { submitGroup }
	
	    </div>
           	        
	  </div>
	    
	); 
    }

}



ShareExperience.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
