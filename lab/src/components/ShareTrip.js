'use strict';

// there is a lot of code duplication with ShareExperience. I'd appreciate hints on how to
// merge the two classes

import React, { PropTypes} from 'react';

import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';

import { WithContext as ReactTags } from 'react-tag-input';

const AsyncTypeahead = asyncContainer(Typeahead);
import { autocompleteAirfields, shareTrip, uploadImage } from './../apiClient.js';

import ImageUploader from 'react-images-upload';

// import validator from 'validator';

export default class ShareTrip extends React.Component {

    constructor(props) {
	super(props)
	this.state = {
	    participants: [],
	    allowNew: false,
	    multiple: false,
	    files: []
	};

	this.inputs = {};
	this.state[ this._airfieldPropertyName('departureAirfield') ] = { isLoading: false, options: [] };

	// the tags callbacks (actually used to deal with participants)
	this.handleDelete = this.handleDelete.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
	
	// couple of constants
	this._departureAirfield = "departureAirfield"
	this._tripDate = "tripDate"
	this._comment = "experienceTitle"
    }

    handleDelete(i) {
        let participants = this.state.participants;
        participants.splice(i, 1);
        this.setState({participants: participants});
    }
    
    handleAddition(tag) {
	
	const { t, i18n } = this.props;

	if (true) { //  (validator.isEmail(tag)) {
            let participants = this.state.participants;	    
            participants.push({
		id: participants.length + 1,
		text: tag
            });
            this.setState({participants: participants});
	} else {
	    this.props.sendError("To add a participant, please use their email address")
	}
    }
 
    handleDrag(tag, currPos, newPos) {
        let participants = this.state.participants;
 
        // mutate array
        participants.splice(currPos, 1);
        participants.splice(newPos, 0, tag);
 
        // re-render
        this.setState({ participants: participants });
    }

    componentDidMount() {
        this.context.mixpanel.track('share trip component loaded');
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


    _shareTrip() {

	var this_ = this
	
	const { t, i18n } = this.props;

	if (!this.state[this._departureAirfield]) {
	    this.context.mixpanel.track('share trip validation warning', { message: 'missing departure airfield' });
	    this.props.sendError("Where did you depart from?")
	    return;
	}

	if (this.inputs[this._tripDate].value == '') {
	    this.context.mixpanel.track('share trip validation warning', { message: 'missing trip date' });
	    this.props.sendError("When did you take this trip?")
	    return;
	}
	
	if (this.inputs[this._comment].value == '') {
	    this.context.mixpanel.track('share trip validation warning', { message: 'missing comment' });
	    this.props.sendError("Could you leave a brief comment about your trip?")
	    return;
	}

	if (this.state.participants.length == 0) {
	    this.context.mixpanel.track('share trip validation warning', { message: 'no participants' });
	    this._sendError("Please add at least one participant, using their email")
	    return;
	}


	var crew = this.state.participants.map(function(participant) {
	    return {
		email: participant.text,
		name: ""
	    }
	})
	
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
	    var allUrls = [].concat.apply([], allFilesUrls);
	    
	    var trip = {
		departureAirfield: this_.state[this_._departureAirfield],
		destinationAirfield: this_.props.destinationAirfield, // this is goofy
		date: this_.inputs[this_._tripDate].value,
		crew: crew,
		comment: this_.inputs[this_._comment].value,
		experienceId: this_.props.experience.id,
		attachments: allUrls
	    }
	    
	    console.log(trip)
	    
	    shareTrip(trip).then(function(body) {
		this_.context.mixpanel.track('new trip saved', { id: body.id });
		this_.props.setYesNo("Thank You", "Congratulations on completing this trip!",
			     	     function() {
					 this_.props.reloadExperience()
				     }, null)
	    }, function(error) {
		this_.context.mixpanel.track('error in share trip page', { 'error': error });
		this_.props.sendError("Sorry, something went wrong");
	    })
	    
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
    

    render() {

	const { t, i18n } = this.props;

	var this_ = this
		let participants = this.state.participants;
    

	let tagsInputGroup =
	    <div className="form-group row">
	    <label htmlFor="experienceId" className="col-sm-4 col-form-label hidden-xs"> Participants </label>
	    <div className="col-8 tags-widget">
	    
	    <ReactTags tags={participants}
	classNames={{
	    tag: 'btn btn-info',
	}}
    	placeholder={ t("Add a new participant's email") }
                    handleDelete={this.handleDelete}
                    handleAddition={this.handleAddition}
                    handleDrag={this.handleDrag} />
            </div>
	    </div>;
	
	let submitGroup =
	    <div className="submit-group row text-center">
	    <div className="col-12">
	    <button type="submit" className="btn btn-primary" onClick={this._shareTrip.bind(this)}>
	    { t('Submit') } </button>
	    </div>
	    </div>


	var imgUploader = <ImageUploader
                	withIcon={true}
                	buttonText='Choose images'
            onChange={this._onDrop.bind(this) }
	     onDelete={this._onDelete.bind(this) }
           
                	imgExtension={['.jpg', '.gif', '.png', '.gif']}
            maxFileSize={20971520}
	    withPreview={true}
	 
		/>


	return (
		<div className="container share-trip">

	    { this_._createAirfieldInput(this_._departureAirfield, t("Where did you depart from?")) }

	    { this_._createDatepicker(this_._tripDate, t("When did you take the trip?")) }
   

	    { this_._createTextarea(this_._comment, t("What would be your comment?")) }

	    { tagsInputGroup }

	    { imgUploader }
	
	    { submitGroup }
	    
	    </div>

	)

    }

    
}




ShareTrip.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
