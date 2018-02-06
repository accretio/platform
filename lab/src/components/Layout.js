'use strict';

import React from 'react';
import { Link } from 'react-router';

import Modal from 'react-modal';

export default class Layout extends React.Component {

    constructor(props) {
	super(props);
	this.state = {
	    error: null
	}
    }
    
    addDrift() {

	var this_ = this
	!function() {
	    var t;
	    if (t = window.driftt = window.drift = window.driftt || [], !t.init)
		return t.invoked ? void (window.console && console.error && console.error("Drift snippet included twice.")) :
		(t.invoked = !0, 
		 t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on" ], 
		 t.factory = function(e) {
		     return function() {
			 var n;
			 return n = Array.prototype.slice.call(arguments), n.unshift(e), t.push(n), t;
		     };
		 }, t.methods.forEach(function(e) {
		     t[e] = t.factory(e);
		 }), t.load = function(t) {
		     var e, n, o, i;
		     e = 3e5, i = Math.ceil(new Date() / e) * e, o = document.createElement("script"), 
		     o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + i + "/" + t + ".js", 
		     n = document.getElementsByTagName("script")[0], n.parentNode.insertBefore(o, n);
		 });
	}();
	drift.SNIPPET_VERSION = '0.3.1';
	drift.load('sx55mxvnzrdc');

	drift.on('ready', function(api) {
	    this_.drift = api
	}); 

    }
    
    componentDidMount() {
	this.addDrift()
    }

    messageTeam(subject) {
	if (this.drift) {
	    this.drift.openChat()
	} else {
	    window.location.href = ("mailto:william@accret.io?subject="+subject);
	}
    }

    _sendError(error) {
	this.setState({ error })
    }

    _resetError(error) {
	this.setState({ error: null })
    }

    addDestination() {
	this.context.history.push("/suggestDestination")
    }
    
    render() {

	var t = this;

	// this modal is used to display error messages throughout the app 
	
	const modalCustomStyles = {
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

	let errorModal =
            <Modal isOpen={this.state.error != null }
	className=""
	style={modalCustomStyles}
        contentLabel="Thank You">

            <div className="modal-dialog" role="document">
            <div className="modal-content">
            <div className="modal-header">
            <h5 className="modal-title">Error</h5>
           
             </div>
            <div className="modal-body">
            <p>{ this.state.error } </p>
            </div>
            <div className="modal-footer">
         
	    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this._resetError.bind(this)}>Ok</button>
      
	</div>
            </div>
            </div>

        </Modal> ;
	
	var child =
	    React.cloneElement(this.props.children, { messageTeam: this.messageTeam.bind(this), sendError: this._sendError.bind(this) }) ;

	var suggestDestinationBtn = null;
	var togglerBtn = null;
	
	if (this.props.location.pathname != "/shareExperience") {
		suggestDestinationBtn =  <li className="nav-item">
        <a className="nav-link" href="/shareExperience">Share an experience</a>
		</li>;
	    togglerBtn = <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon"></span>
		</button>;
	}


	return (
	   
	    	<div id="wrapper" className="wrapper">
		 { errorModal }
		<nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
	 
		       <a className="navbar-brand" href="/">GA Adventures</a>
	         
	    { togglerBtn }



	     <div className="collapse navbar-collapse" id="navbarSupportedContent">
    <ul className="navbar-nav mr-auto">
		{ suggestDestinationBtn }
    </ul>

	    </div>
	        </nav>

		<div className="app-content">{child}</div>
		
	        </div>
	);
    }

}

Layout.contextTypes = {
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
}
