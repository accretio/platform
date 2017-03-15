'use strict';

import React from 'react';
import { Link } from 'react-router';
import Dropzone from 'react-dropzone';

export default class ImportSingleFile extends React.Component {

  onDrop(acceptedFiles, rejectedFiles) {
    
    console.log('Accepted files: ', acceptedFiles);
    console.log('Rejected files: ', rejectedFiles);
    
    var req = request.post('/api/upload');
    acceptedFiles.forEach((file)=> {
      req.attach(file.name, file);
    });

    req.end(this.uploadCallback);
  }

  uploadCallback() {

    alert("upload callback");
    
  }
  

  render() {
    return (
        <div className="import-single-file">

        <h2>Import a new design</h2>

        <div className="container-fluid">
     
        <div className="row">
          <div className="row justify-content-center">
            <div className="col-12"> 
                <Dropzone onDrop={this.onDrop}>
              <div>Try dropping some files here, or click to select files to upload.</div>
            </Dropzone>
            </div>
          </div>
        </div>
        
      </div>
        </div>
    );
  }
}
