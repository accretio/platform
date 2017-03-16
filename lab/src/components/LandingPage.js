'use strict';

import React from 'react';
import { Link } from 'react-router';

export default class LandingPage extends React.Component {
  render() {
    return (
        <div className="landing-page">
          <h1>On-demand assembly lines</h1>
          <div className="row justify-content-center">
             <div className="col-sm-4">
                <div className="card">
                   <div className="card-block">
                      <h3 className="card-title">Build a new assembly line</h3>
                      <p className="card-text">Upload an OpenScad file or import a Thingiverse profile.</p>
                      <a href="/import/importSingleOpenScadFile" className="btn btn-primary">Create</a>
                   </div>
                </div>
            </div>

            <div className="col-sm-4">
                <div className="card">
                   <div className="card-block">
                      <h3 className="card-title">Manage your factory</h3>
                      <p className="card-text">Edit your assembly lines and monitor your sales.</p>
                      <a href="#" className="btn btn-primary">Manage</a>
                   </div>
                </div>
            </div>
         </div>
      </div>
    );
  }
}
