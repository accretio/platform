'use strict';

import React from 'react';
import { Link } from 'react-router';

export default class Layout extends React.Component {

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

    addDestination() {
	this.context.history.push("/suggestDestination")
    }
    
    render() {

	var t = this;
	var child =
	    React.cloneElement(this.props.children, { messageTeam: this.messageTeam.bind(this) }) ;

	var suggestDestinationBtn = null;
	var togglerBtn = null; 
	console.log(this.props.location);

	if (this.props.location.pathname != "/suggestDestination") {
		suggestDestinationBtn =  <li className="nav-item">
        <a className="nav-link" href="/suggestDestination">Suggest a restaurant</a>
		</li>;
	    togglerBtn = <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon"></span>
		</button>;
	}

	return (
	    	<div id="wrapper" className="wrapper">

		<nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
	 
		       <a className="navbar-brand" href="/">GALunches</a>
	         
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
