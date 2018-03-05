'use strict';

import React, { PropTypes} from 'react';

import ShareTrip from './ShareTrip.js';

export default class ExperienceFeedMenu extends React.Component {


    constructor(props) {
	super(props)
	this.state = {
	    mode: 'trip.menu'
	}
    }


    _menuItem(label) {

	const { t, i18n } = this.props;
	var cl = 'nav-link'
	if (this.state.mode == label) {
	    cl = 'nav-link active'
	} 
	return <li className="nav-item">
            <a className= { cl } href="#">{ t(label) }</a>
	    </li>; 

    }

    _bodyTrip() {

	const { t, i18n } = this.props;

	return <div className="card-body experience-feed-menu">
	    <h5 className="card-title"> { t('Share your trip') } </h5>
	    <p className="card-text"> { t('You lived this adventure too? Let us know how it went!') } </p>
	    <ShareTrip { ...this.props } />
	</div>
    }
    
    render() {

	var header = 
	    <div className="card-header">
	    <ul className="nav nav-tabs card-header-tabs">
	    { this._menuItem.bind(this)('trip.menu') }
	    </ul>
            </div>;

	var body;
	
	switch (this.state.mode) {
	case 'trip.menu': 
	    body = this._bodyTrip.bind(this)();
	    break;
	}
 
	return <div className="card text-center experience-feed-menu">
	    { header }
	    { body }
	    </div>; 
    }
}
