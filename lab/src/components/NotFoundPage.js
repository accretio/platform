'use strict';

import React from 'react';
import { Link } from 'react-router';

export default class NotFoundPage extends React.Component {
  render() {
    return (
      <div className="not-found container-fluid">
        <div className="row justify-content-center">
          <div className="col-4">
            <img src="/img/robot2.jpg" className="img-fluid img-thumbnail" alt="404" />
        </div>
        </div>
        <div className="row justify-content-center">
        <div className="col-6">
        Oops ... I found a bearing, but not the page you requested!
           </div>
        </div>
      </div>
        
    );
  }
}


