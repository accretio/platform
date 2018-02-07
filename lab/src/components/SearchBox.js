'use strict';

import React, { PropTypes} from 'react';

import { autocompleteAirfields, runSearchAroundAirfield } from './../apiClient.js';
import { asyncContainer, Typeahead } from 'react-bootstrap-typeahead';

const AsyncTypeahead = asyncContainer(Typeahead);

export default class SearchBox extends React.Component {

    constructor(props) {
	super(props);
	this.state = {
	    allowNew: false,
	    isLoading: false,
	    multiple: false,
	    options: [],
	    results: [],
	    tagsWithCounts: {},
	    toggledOff: []
	};
    }

    _searchAirfields(query) {
	var t = this
	this.setState({isLoading: true});
	console.log("running typeahead search for query " + query)
	this.context.mixpanel.track('autocomplete airfield search', { query: query });
	autocompleteAirfields(query).then(function(hits) {
	    t.setState({
		isLoading: false,
		options: hits,
	    })
	})
     }

    _updateStateWithResults(results) {

	var tagsWithCounts = {};

	results.map(function(result) {
	    result.tags.map(function(tag){
		tagsWithCounts[tag] = 1 + (tagsWithCounts[tag] || 0);
	    })
	})
	
	this.setState({ results, tagsWithCounts, toggledOff: [] })
    }
    
    _handleChange(e) {
	var t = this
	if (e.length > 0) {
	    this.context.mixpanel.track('searching for experiences around airfield', { airfield: e[0] });
	    runSearchAroundAirfield(e[0].id).then(function(results) {
		 t._updateStateWithResults.bind(t)(results.results)
		 t.props.handleResults(results.location, results.results);
	    })
	} else {
	    t.props.handleResults(null, []);
	    t._updateStateWithResults.bind(t)([])
	}
    }


    _updateResultsBasedOnTags(){
	var toggledOff = this.state.toggledOff
	var activeTags = new Array()
	this.state.results.map(function(result) {
	    result.tags.map(function(tag){
		if (toggledOff.indexOf(tag) == -1) {
		    activeTags.push(tag)
		}
	    })
	})

	this.props.handleResults(null, this.state.results.filter(function(result)  {
	    // return true if at least one tag is in the activeTag array
	    var keep = false
	    result.tags.map(function(tag) {
		keep = keep || (activeTags.indexOf(tag) > -1)
	    })
	    return keep ;
	}))	

    }
    
    _toggleTag(tag) {
	
	if (this.state.toggledOff.indexOf(tag) == -1) {
	    // it is currently toggled on
	    this.context.mixpanel.track('toggling tag', { tag: tag, newState: false });
	    var nToggledOff = this.state.toggledOff
	    nToggledOff.push(tag)
	    this.setState({ toggledOff: nToggledOff })
	    this._updateResultsBasedOnTags.bind(this)()

	} else {
	    // it is currently toggled off
	    this.context.mixpanel.track('toggling tag', { tag: tag, newState: true });
	    var nToggledOff = this.state.toggledOff
	    nToggledOff.splice(nToggledOff.indexOf(tag), 1)
	    this.setState({ toggledOff: nToggledOff })
	    this._updateResultsBasedOnTags.bind(this)()
	}
	
     }
    
    render() {
	
	var t = this;

	let airfieldTypeahead = <AsyncTypeahead
	labelKey="name"
	isLoading={this.state.isLoading}
	onSearch={this._searchAirfields.bind(this)}
	options={this.state.options}
	placeholder="Your homebase?"
	onChange={this._handleChange.bind(this)}
/>;
	var airfieldSearch =
	    <div className="col">
	    { airfieldTypeahead }
            </div>

	var tagsWithCounts = this.state.tagsWithCounts;

	var tags = Object.keys(tagsWithCounts).map(function(tag, i) {
	    var count = tagsWithCounts[tag]
	    var className; 
		if (t.state.toggledOff.indexOf(tag) > -1) {
		    className = "btn btn-light" 
		} else {
		    className = "btn btn-info"
		}
	    return (<button key = { i } className= { className } onClick = { t._toggleTag.bind(t, tag) } >
		    { tag + " (" + count + ")" } 
	            </button>) 
    
	})

	return (<div className="searchBox">

		<div className="row">
		{ airfieldSearch }
		</div>

		<div className="row tags">
		{ tags }
		</div>

		</div>); 
    }

}



SearchBox.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
