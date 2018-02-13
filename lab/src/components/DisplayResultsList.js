'use strict';

import React, { PropTypes} from 'react';
 
export default class DisplayResultsList extends React.Component {

    constructor(props) {
	super(props)
    }

    componentDidMount() {
	
    }

    _formatResult(result, i) {

	var this_ = this
	const { t, i18n } = this.props;
	
	console.log(result);

	var tags = result.tags.map(function(tag, j) {
	    return(<button type="button" key = { j } className="btn btn-outline-secondary tag">
		   { t(tag) } </button>)
	})
	
	return (<div className="card" key = { i }>

		<div className="card-body">
		<h5 className="card-title"> { result.title } </h5>

		<p className="card-text tags"> { tags } </p>
		
		<p className="card-text"> { result.short_description } ... </p>
	
		
		<button className="btn btn-info" onClick = { function() {
		    this_.props.history.push('/experience/' + result.id)
		} }> { t('Read More') } </button>
		</div>
 
		</div>)
	
    } 

    
    render() {

	const { t, i18n } = this.props;
	
	var results = this.props.results

	return (<div className="display-results-list card-columns">
		
		{
		    results.map(this._formatResult.bind(this))
		}
	       </div>);

    }
    
}




DisplayResultsList.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};
