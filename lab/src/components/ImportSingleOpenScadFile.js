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
            name: "",
            gallery: [],
            description: "", 
            singleOpenScadFile: null,
            args: new Array(),
            currentArg: '',
            error: ''
        };
        
    }
    
    onSubmitArg(event) {
        let newArgs = this.state.args.slice();
        newArgs.push(this.state.currentArg);
        this.setState({ args: newArgs, currentArg: '' });
        console.log(this.inputEntry);
        this.inputEntry.value="";
        event.preventDefault();
    }
    
    onNameChange(event) {
        this.setState({ name: event.target.value });
    }
    
    onDescriptionChange(event) {
        this.setState({ description: event.target.value });
    }

    onArgChange(event) {
        this.setState({ currentArg: event.target.value });
    }
    
    resetFile() {
        this.setState({singleOpenScadFile: null, args: [], currentArg: '', description: '' });
    }
    
    createRecipe() {
        fetch('/api/createRecipe', {
            method: 'post',
            headers: new Headers({
	        'Content-Type': 'application/json'
            }),
            body: JSON.stringify(this.state) // we could trim some fields 
        }).then(function(response){
            return response.json();
        }).then(this.gotoRecipe.bind(this), this.updateError.bind(this));
    }
    
    updateError(error) {
        this.setState({ error: error }); 
    }
    
    gotoRecipe(response) {
        this.props.history.push('/product/' + response.id);
    }

    onUploadStart(file, next) {
        next(file);
    }

    onUploadProgress() {

    }

    onUploadError() {
        console.log("error");
        this.setState({ error: "Couldn't upload the file"});
    }

    onUploadFinish(result, file) {
        console.log(result);
        this.setState({ singleOpenScadFile: result });
    }

    onUploadFinishGallery(result, file) {
        console.log(result);
        var gallery = this.state.gallery.slice();
        gallery.push(result);
        this.setState({ gallery: gallery });
    }

    resetError() {
        this.setState({ error: '' }); 
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
        } ;
        
        let filePicker = null; 

        if (this.state.singleOpenScadFile) {
            filePicker = <div>
                <span className="filename">{this.state.singleOpenScadFile.filename}</span>
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
            scrubFilename={(filename) => filename.replace(/[^\w\d_\-\.]+/ig, '')} />; 
        }

        let namePicker = <input type="text" onChange={this.onNameChange.bind(this)} placeholder="Name" />;
        
        let descriptionPicker = descriptionPicker = <textarea onChange={this.onDescriptionChange.bind(this)} placeholder="Object description" /> ;

        let currentArgs = this.state.args.map(function(arg, index) { return(<div key={index+1} className="row"> {arg}: String </div>); }) ;
        
        let addArg =
                <div className="row" key="0">
                <form onSubmit={this.onSubmitArg.bind(this)}>
                <input type="text" ref={el => this.inputEntry = el} onChange={this.onArgChange.bind(this)} placeholder="New argument to the OpenScad script" />
                <input type="submit" value="Add" />
                </form>
            </div> ;

        let argPicker = Array(currentArgs, addArg);
        
        let submitButton =
            submitButton =
                <div className="row">
                <button className="btn" onClick={this.createRecipe.bind(this)}>  Create </button>
                </div>;

        

        let modal =
                <Modal isOpen={this.state.error != ''}
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

            </Modal> ;


        var addGallery =
                <ReactS3Uploader
        key="0"
        signingUrl="/api/s3/sign"
        signingUrlMethod="GET" 
        accept="*"
        preprocess={this.onUploadStart.bind(this)}
        onProgress={this.onUploadProgress.bind(this)}
        onError={this.onUploadError.bind(this)}
        onFinish={this.onUploadFinishGallery.bind(this)}
        uploadRequestHeaders={{}}
        contentDisposition="auto"
        scrubFilename={(filename) => filename.replace(/[^\w\d_\-\.]+/ig, '')} />; 

        var currentGallery = this.state.gallery.map(function (file, pos) {
            var url = "/api" + file.publicUrl; 
            return (<img key={pos+1} src={url}/>); }); 

        var galleryPicker = Array(currentGallery, addGallery);
        
        var options = null;
        if (this.state.singleOpenScadFile) {
            options = <div>
                { namePicker }
            { descriptionPicker }
            { argPicker }
            { galleryPicker }
            { submitButton }
            </div>; 
        }
        
            return (
                
                <div className="import-file">
                  { modal }
                  <h2>Import an OpenScad file</h2>

                  <div className="container-fluid recipe">
                    
                    { filePicker }
                    { options }
                  </div>

                  
                </div>

            );
    }
}
