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

  <div className="row justify-content-center">
             <div className="col-sm-8">
          <div className="jumbotron">
            <h1 className="display-3">Custom panel overlay</h1>
            <p className="lead">Position your avionics on a virtual panel. Receive a plywood prototype or the real deal milled in aviation aluminium.</p>
            <hr className="my-4" />
            <p>Our standard library includes common equipments from leading avionics brands and is easily expandable if needed</p>
            <p className="lead">
    <a className="btn btn-primary btn-lg" href="#" role="button">Get started</a>
  </p>

          </div>
             </div>
          </div>
      </div>
    );
  }
}

LandingPage.contextTypes = {
    mixpanel: PropTypes.object.isRequired
};
