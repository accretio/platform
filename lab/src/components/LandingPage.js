'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';

export default class LandingPage extends React.Component {

    componentDidMount() {
        this.context.mixpanel.track('landing page loaded');
    }
    
    render() {
    return (
        <div className="landing-page">

            <div className="jumbotron">

	    <h1 className="display-4">Want a new panel?</h1>

	    <p className="lead">Position your avionics on a mock panel. Receive a plywood prototype. Order the final cut to your exact specifications.</p>

	    <hr className="my-4" />
            
            <p className="lead">

	    <span className="get-started">
	        <a className="btn btn-primary btn-lg" href="#" role="button">Create New Panel</a>
	    </span>
	    <span className="separator" />
	    <span>
	      <input type="text" className="panel-id" />
	      <a className="btn btn-primary btn-lg" href="#" role="button">Retrieve Panel</a>
	    </span>
	
	    </p>

       </div>
     </div>
         
     
    );
  }
}

LandingPage.contextTypes = {
    mixpanel: PropTypes.object.isRequired
};
