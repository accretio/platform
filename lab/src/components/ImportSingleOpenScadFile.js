'use strict';

import React from 'react';
import { Link } from 'react-router';

import request from 'superagent';

import ReactDOM from 'react-dom';
import Modal from 'react-modal';


import ReactS3Uploader from 'react-s3-uploader';

export default class ImportSingleOpenScadFile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      file: null,
      args: new Array(),
      currentArg: '',
      error: ''
    };
   
  }
  
  onSubmitArg(event) {
    let newArgs = this.state.args.slice();
    newArgs.push(this.state.currentArg);
    this.setState({ args: newArgs, currentArg: ''});
    console.log(this.inputEntry);
    this.inputEntry.value="";
    event.preventDefault();
  }

  onArgChange(event) {
    this.setState({currentArg: event.target.value});
  }


  resetFile() {
    this.setState({file: null, args: [], currentArg: ''});
  }
  
  createRecipe() {
     fetch(this.props.url).then(function(response){
        // perform setState here
    });
  }

  onUploadStart(file, next) {
    next(file)
  }

  onUploadProgress() {

  }

  onUploadError() {
    console.log("error");
    this.setState({ error: "Couldn't upload the file"});
  }

  onUploadFinish(result, file) {
    console.log(result);
    this.setState({ file: result });
  }

  resetError() {
    this.setState({ error: '' })
  }
  render() {
    console.log("calling render");
    console.log(this.state);

    const customStyles = {
      overlay : {
        position          : 'fixed',
        top               : 0,
        left              : 0,
        right             : 0,
        bottom            : 0,
        backgroundColor   : 'rgba(255, 255, 255, 0.75)'
      },
      content : {
        position                   : 'absolute',
        top                        : '40px',
        left                       : '40px',
        right                      : '40px',
        bottom                     : '40px',
        border                     : 'none',
        background                 : '',
        overflow                   : 'auto',
        WebkitOverflowScrolling    : 'touch',
        borderRadius               : '4px',
        outline                    : 'none',
        padding                    : '20px'

  }
    }
    
    let filePicker = null

    if (this.state.file) {
      filePicker = <div>
        <span className="filename">{this.state.file.filename}</span>
        <button className="btn" onClick={this.resetFile.bind(this)}>Remove</button>
      </div>;
    } else {
      filePicker = <ReactS3Uploader
      signingUrl="/api/s3/sign"
      signingUrlMethod="GET"
      accept="*"
      preprocess={this.onUploadStart.bind(this)}
      onProgress={this.onUploadProgress.bind(this)}
      onError={this.onUploadError.bind(this)}
      onFinish={this.onUploadFinish.bind(this)}
      uploadRequestHeaders={{}}
      contentDisposition="auto"
      scrubFilename={(filename) => filename.replace(/[^\w\d_\-\.]+/ig, '')}
      />
    }

    let currentArgs = this.state.args.map(function(arg, index) { return(<div key={index+1} className="row"> {arg}: String </div>) })
    
    let addArg =
        <div className="row" key="0">
        <form onSubmit={this.onSubmitArg.bind(this)}>
        <input type="text" ref={el => this.inputEntry = el} value={this.currentArg} onChange={this.onArgChange.bind(this)} placeholder="New argument to the OpenScad script" />
        <input type="submit" value="Add" />
        </form>
        </div>

    let argPicker = null
    if (this.state.file) {
      argPicker = Array(currentArgs, addArg);
    } else {
      argPicker = "";
    }

    let submitButton = null
    if (this.state.file) {
      submitButton =
        <div className="row">
        <button className="btn" onClick={this.createRecipe.bind(this)}>
        Create
      </button>
        </div>
    } else {
      submitButton = "";
    }

    let modal =
          <Modal
           isOpen={this.state.error != ''}
    className=""
    style={customStyles}
           contentLabel="Error">

  <div className="modal-dialog" role="document">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Error</h5>
        <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.resetError.bind(this)}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className="modal-body">
      <p>{this.state.error}</p>
      </div>
      <div className="modal-footer">
      <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.resetError.bind(this)}>Close</button>
      </div>
    </div>
  </div>

      </Modal>
      
    return (
      
        <div className="import-file">
            { modal }
            <h2>Import an OpenScad file</h2>

            <div className="container-fluid recipe">
               
            { filePicker }
            { argPicker }
            { submitButton }
           </div>

      
       </div>

    );
  }
}
