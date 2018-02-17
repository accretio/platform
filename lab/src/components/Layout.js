'use strict';

import React from 'react';
import { translate, Trans } from 'react-i18next';

import { Link } from 'react-router';

import Modal from 'react-modal';

class Layout extends React.Component {

    constructor(props) {
	super(props);
	const { t, i18n } = this.props;
	this.state = {
	    error: null,
	    language: i18n.language
	}
    }
    
    _changeLanguage(language) {
	const { t, i18n } = this.props;
	i18n.changeLanguage(language);
	this.setState({ language });
    
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

    _sendError(message, callback = function(){}) {
	var t = this
	this.setState({ error: { message, callback: function(){ t.setState({ error: null }); callback() } } })
    }

    addDestination() {
	this.context.history.push("/suggestDestination")
    }

    _setYesNo(title, message, yesCallback, noCallback) {
	var t = this
	var yesNoParams = {
	    title: title,
	    message: message,
	}
	yesNoParams.yes = function(){ t.setState({ yesno: null }) ; yesCallback() };
	if (noCallback) {
	yesNoParams.no = function(){ t.setState({ yesno: null }) ; noCallback() };
	} else {
	    yesNoParams.no = null
	}
	t.setState({ yesno: yesNoParams })

    }
    
    render() {


	console.log("re-render layout with " + this.state.language);
	const { t, i18n } = this.props;
	var this_ = this;

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
            <h5 className="modal-title"> { t('Error') } </h5>
           
             </div>
            <div className="modal-body">
            <p>{ this.state.error ? t(this.state.error.message) : '' } </p>
            </div>
            <div className="modal-footer">
         
	    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={
		this.state.error ? this.state.error.callback : function(){}
	    }>Ok</button>
      
	</div>
            </div>
            </div>

        </Modal> ;


	var buttonNo = null;

	if (this.state.yesno ? this.state.yesno.no : null) {
	    
	    buttonNo = <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={ this.state.yesno ? this.state.yesno.no : function(){} } > { t('No') } </button>
  	}
		
		let yesNoModal =
            <Modal isOpen={this.state.yesno != null }
	className=""
	style={modalCustomStyles}
	contentLabel="yesno"
        >

            <div className="modal-dialog" role="document">
            <div className="modal-content">
            <div className="modal-header">
            <h5 className="modal-title">{ this.state.yesno ?  t(this.state.yesno.title) : '' }</h5>
           
             </div>
            <div className="modal-body">
            <p>{ this.state.yesno ? t(this.state.yesno.message) : '' } </p>
            </div>
            <div className="modal-footer">

	{ buttonNo }
	    <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={ this.state.yesno ? this.state.yesno.yes : function(){} }> { t('Yes') } </button>
      
	</div>
            </div>
            </div>

        </Modal> ;

	var child =
	    React.cloneElement(this.props.children, { messageTeam: this.messageTeam.bind(this),
						      sendError: this._sendError.bind(this),
						      setYesNo: this._setYesNo.bind(this),
						      t: this.props.t,
						      i18n: this.props.i18n }) ;


	var contactBtn = <li className="nav-item">
	    <a className="nav-link" href="mailto:william@accret.io"> { t('contact') } </a>
	    </li>;

	    
	var suggestDestinationBtn = null;
	var tripSuggesterBtn = null;
	
	var togglerBtn = <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon"></span>
	    </button>;

	if (this.props.location.pathname != "/shareExperience") {
		suggestDestinationBtn =  <li className="nav-item">
		<Link className="nav-link" to="/shareExperience" onClick = { function() { this_.props.history.push('/shareExperience'); return false; } } > { t('share_an_experience') } </Link>
		</li>;
	}
	
	if (this.props.location.pathname != "/tripSuggester") {
		tripSuggesterBtn =  <li className="nav-item">
	
	    	<Link className="nav-link" to="/tripSuggester" onClick = { function() { this_.props.history.push('/tripSuggester'); return false; } } > { t('trip_suggester') } </Link>
		</li>;
	}


	var langToggler = <li className="nav-item dropdown">
        <a className="nav-link dropdown-toggle dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            { t(this.state.language) }
        </a>
        <div className="dropdown-menu" aria-labelledby="navbarDropdown">
            <button className="dropdown-item" onClick={ this._changeLanguage.bind(this, "en") } type="button"> { t('en') } </button>
	    <button className="dropdown-item" onClick={ this._changeLanguage.bind(this, "fr") } type="button">
	    { t('fr') } </button>
	</div>
	    </li> ;

	return (
	   
	    	<div id="wrapper" className="wrapper">
		{ errorModal }
	    { yesNoModal }
		<nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
		<Link className="navbar-brand" to="/" onClick = { function() { this_.props.history.push('/'); return false; } } >Accretio</Link>
	
		{ togglerBtn }



	     <div className="collapse navbar-collapse" id="navbarSupportedContent">
		<ul className="navbar-nav mr-auto">
		{ suggestDestinationBtn }
	        { tripSuggesterBtn }
	    	{ langToggler }
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

export default translate('translations')(Layout);

