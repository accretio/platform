'use strict';

import React from 'react';
import { Link } from 'react-router';

export default class LandingPage extends React.Component {
  render() {
    return (
        <div className="landing-page">
          <div className="row justify-content-center">
             <div className="col-sm-4">
                <div className="card">
                   <div className="card-block">
                      <h3 className="card-title">Submit a new product</h3>
                      <p className="card-text">Upload an OpenScad file or import a Thingiverse profile.</p>
                      <a href="/importSingleFile" className="btn btn-primary">Create</a>
                   </div>
                </div>
            </div>

            <div className="col-sm-4">
                <div className="card">
                   <div className="card-block">
                      <h3 className="card-title">Manage your production line</h3>
                      <p className="card-text">Edit your product recipes and monitor your sales.</p>
                      <a href="#" className="btn btn-primary">Manage</a>
                   </div>
                </div>
            </div>
         </div>
      </div>
    );
  }
}
