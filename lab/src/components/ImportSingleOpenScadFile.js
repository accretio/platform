'use strict';

import React from 'react';
import { Link } from 'react-router';
import Dropzone from 'react-dropzone';
import request from 'superagent';

export default class ImportSingleOpenScadFile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      file: null,
      args: new Array(),
      currentArg: ''
    };
   
  }
  
  onDrop(acceptedFiles) {
    console.log(this.state);
    if (acceptedFiles.length > 0) {
      this.setState({ file: acceptedFiles[0] });
    }
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


  createRecipe() {

  }
  
  render() {
    console.log("calling render");
    console.log(this.state);

    let filePicker = null

    if (this.state.file) {
      filePicker = <div>we have a file</div>;
    } else {
      filePicker =
        <Dropzone onDrop={this.onDrop.bind(this)}>
          <div>Drop your OpenScad file here, or click to select a file to upload</div>
        </Dropzone>;
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
    return (
      
        <div className="import-file">

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
