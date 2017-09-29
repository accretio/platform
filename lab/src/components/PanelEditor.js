'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import InstrumentPicker from './panelEditor/InstrumentPicker';
import Instrument from './../models/Instrument.js';
import { instanceOf } from 'prop-types';
import { CookiesProvider, withCookies, Cookies } from 'react-cookie';

import {fabric} from 'fabric';

import { parseString, toSVG } from '../dxf/lib/index.js';

// the catalog
import { findInstrument, catalog } from './../catalog/Catalog.js'; 

// the api client

import { getPanel, getLayout, savePanel } from './../apiClient.js';

var DESIGN = 0;
var RENDER = 1;

export default class PanelEditor extends React.Component {
    
    constructor(props) {

        super(props);
        
        this.state = {
	    id: props.params.id,
            catalog: catalog,
            instruments: [],
            viewer: null,
            canvas: null,
            renderingMode: DESIGN
        };
	
    }

    retrieveInitialState() {
	this.context.mixpanel.track('retrieving panel', { 'id': this.state.id });
	getPanel(this.state.id).then(this.getLayout.bind(this))
    }

    getLayout(panel) {

	if (panel.layout == null) {
	    panel.layout = 1 // not correct
	}

	getLayout(panel.layout).then((layout) => this.loadState.bind(this)(panel, layout))
	
    }

    loadState(panel, layout) {
	// iterate on the json doc & create all the canvas objects we need
	var this_ = this

	var canvas = this.state.canvas

	// inject the layout

	var parsed = parseString(layout.dxf);
	var svg = toSVG(parsed);

	var group = [];
	
	fabric.loadSVGFromString(svg, function(objects,options) {

            var loadedObjects = new fabric.Group(group);

            loadedObjects.set({
		top: 0,
		left: 0,
		scaleX: 1,
                scaleY: 1,
          	lockMovementX: true,
		lockMovementY: true,
		lockScalingX: true,
		lockScalingY: true,
		selectable: false
            });

            canvas.add(loadedObjects);
	    this_.setState({ aircraftTemplateWidth: loadedObjects.width,
			     aircraftTemplateHeight: loadedObjects.height });

	    var zoom = Math.min(canvas.width / loadedObjects.width,
			        canvas.height / loadedObjects.height)
	    console.log("width: " + canvas.width + " height: " + canvas.height+ " zoom: " + zoom);

	    canvas.setZoom(zoom);
            canvas.renderAll()
	    
        },function(item, object) {
            object.set('id',item.getAttribute('id'));
            group.push(object);
        });
	
	// inject the instruments
	
	var instruments = panel.instruments
	if (instruments) {
	    instruments.map(function(instrument) {
		
		console.log(instrument)
		var instr = findInstrument(instrument.name)
		if (instr) {
		    var shape = instr.factory()
		    
		    // now we position the shap
		    shape.top = instrument.top ;
		    shape.left = instrument.left ;
		    
		    // and now it is ready to be injected
		    canvas.add(shape);
		}
	    })
	}

//this.resizeCanvasContainer.bind(this);
	

	// render the canvas

	canvas.renderAll()
	
	this.setState({ layout : layout })
	
	
    }

    saveState() {
	var json = this.stateToJson()
	savePanel(json)
    }

    fork() {
	var t = this
	var oldId = this.state.id
	var json = this.stateToJson()
	delete json["id"];
	savePanel(json).then(function(response) {
	    t.context.cookies.set('panelId', response.id)
	    t.context.mixpanel.track('forking panel', { 'id': response.id, 'old_id': oldId });
	    t.context.history.push("/panel/"+response.id);
	})
    }
    
    stateToJson() {

	var canvas = this.state.canvas

	var allInstruments =
	    this.state
	    .canvas.getObjects()
	    .filter(function(obj) {
		return (obj.instrument != undefined)
	    })

	var currentSelection = this.state.canvas.getActiveObjects()
	
	var allInstrumentsWithPositions =
	    allInstruments.map(function(obj){
		
		var offsetTop = 0
		if (obj.group) offsetTop = obj.group.top + obj.group.height/2
		
		var offsetLeft = 0
		if (obj.group) offsetLeft = obj.group.left  + obj.group.width/2
		
		return {
		    name: obj.instrument,
		    top: obj.top + offsetTop,
		    left: obj.left + offsetLeft
		}
	    })

	return({
	    id: this.state.id,
	    layout: this.state.layout.id,
	    instruments: allInstrumentsWithPositions
	})
	
	
    }

    resizeCanvasContainer() {
	console.log("resizing the canvas, " + this.canvasContainer.clientHeight + " px");
	var canvas = this.state.canvas
	canvas.setWidth(this.canvasContainer.clientWidth);
	canvas.setHeight(this.canvasContainer.clientHeight);
	canvas.setZoom(Math.min(
	    canvas.width / this.state.aircraftTemplateWidth,
	    canvas.height / this.state.aircraftTemplateHeight
	));
	canvas.calcOffset(); 
	canvas.renderAll();
	canvas.calcOffset();  
    }

    componentDidMount() {
        this.context.mixpanel.track('panel editor page loaded');

	var this_ = this;
	
	var canvas = new fabric.Canvas('canvas');
	
	canvas.setWidth(this.canvasContainer.clientWidth);
	canvas.setHeight(this.canvasContainer.clientHeight);
	
	// set up pan zoom

	this.canvasContainer.addEventListener("mousewheel", this.zoomCanvas.bind(this));
        this.setState({ canvas: canvas });

	// we need to resize the canvas container
	
	this.resizeCanvasContainer.bind(this);
	window.addEventListener("resize", this.resizeCanvasContainer.bind(this));

	// event handler: we number elements by selection order. it comes handy when computing
	// the pivot in alignment function

	var counter = 0; 
	canvas.on('object:selected', function(options) {
	    counter += 1;
	    options.target.selectionCounter = counter; 
	});

	// event handler: we save the panel when things move
	//	canvas.on('object:added', this.savePanel)
	canvas.on('object:modified', this.saveState.bind(this))
	
	// now we can load the stored panel

	this.retrieveInitialState()

	// and we define some global hidden helpers

	window.fork = this.fork.bind(this);
    }

    zoomCanvas(e) {
	var evt=window.event || e;
	var delta = evt.detail? evt.detail*(-120) : evt.wheelDelta;
	var curZoom = this.state.canvas.getZoom(),  newZoom = curZoom + delta / 2000,
	    x = e.offsetX, y = e.offsetY;
	//applying zoom values.
	this.state.canvas.zoomToPoint({ x: x, y: y }, newZoom);
	if(e != null)e.preventDefault();
	return false;

    }
    
    addInstrument(instrument) {
        var instruments = JSON.parse(JSON.stringify(this.state.instruments));
        instruments.push(instrument);
        this.setState({ instruments: instruments });

	var s = instrument.factory();

	/* 

	// for some unknown reason adding text in the boxes wrecks alignment
	
	if (instrument.name != 'ROUND 3.125') {
	var t = new fabric.Text(instrument.name, {
        fontFamily: 'sans-serif',
        fontSize: 1,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        left: s.width/2 + 0.5 ,
        top: s.height/2 + 0.5,
	
	});

	t.setColor('white');


	var g = new fabric.Group([s, t],{
        // any group attributes here
	}); 
	g.height = s.height ;
	g.width = s.width ; 
        this.state.canvas.add(s);

	} else { */
	
	this.context.mixpanel.track('adding instrument', { 'id': this.state.id,
							   'instrument': instrument.name });

	this.state.canvas.add(s);
	console.log(this.stateToJson());
    }

    
    viewDesign() {
        this.setState({ renderingMode: DESIGN });
        
    }

    viewRender() {
        this.setState({ renderingMode: RENDER });
    }

    alignSelectedObjectsVertically() {

        var curSelectedObjects =
	    this.state.canvas.getActiveObjects().sort(function(a, b) {
		return (b.selectionCounter - a.selectionCounter); 
	    });
	
	if (curSelectedObjects) {
	    var pivot = curSelectedObjects[0].left + curSelectedObjects[0].width / 2;
	    curSelectedObjects.map(function(obj) {
		obj.left = (pivot - obj.width / 2);
		obj.setCoords();
	    });
	    this.context.mixpanel.track('align vertically', { 'id': this.state.id });
	    this.state.canvas.renderAll();
	    this.saveState.bind(this)()
	}
    }

    alignSelectedObjectsHorizontally() {

	var curSelectedObjects =
	    this.state.canvas.getActiveObjects().sort(function(a, b) {
		return (b.selectionCounter - a.selectionCounter); 
	    });
	
	if (curSelectedObjects) {
            var pivot = curSelectedObjects[0].top + curSelectedObjects[0].height / 2; 
            curSelectedObjects.map(function(obj) {
		obj.top = pivot - obj.height / 2;
		obj.setCoords();
	    });
	    this.context.mixpanel.track('align horizontally', { 'id': this.state.id });
	    this.state.canvas.renderAll();
	    this.saveState.bind(this)()
	}
	
    }

    centerSelectedObjects() {
	
	var center = this.state.aircraftTemplateWidth / 2;

	var obj = this.state.canvas.getActiveObject();

	if (obj) {
	    obj.left = center - (obj.width / 2);
	    obj.setCoords();
	    this.context.mixpanel.track('center objects', { 'id': this.state.id });
	    this.state.canvas.renderAll();
	    this.saveState.bind(this)()
	}
	
    }

    spaceSelectedObjectsRegularlyVertically() {
	var spacing = Number(this.verticalSpacing.value); // inches
	if (spacing == NaN)  {
	    alert("please enter a valid spacing in inches")
	} else {
	    
	    var curSelectedObjects = this.state.canvas.getActiveObjects();
	    console.log(curSelectedObjects);
	    if (curSelectedObjects) {
		curSelectedObjects.sort(function(a, b) {
		    return a.top - b.top;
		});
		var currentTop = curSelectedObjects[0].top; // ok because if curSelectedObject isn't null, it has at least one item. 
		curSelectedObjects.map(function(obj) {
		    obj.top = currentTop;
		    console.log("height is " + obj.height);
		    currentTop += obj.height + spacing;
		    obj.setCoords();
		});
		this.context.mixpanel.track('space vertically', { 'id': this.state.id, 'spacing': spacing });
	 	this.state.canvas.renderAll();
		this.saveState.bind(this)()
	    }
	}
    }

    spaceSelectedObjectsRegularlyHorizontally() {
	var spacing = Number(this.horizontalSpacing.value); // inches
	if (spacing == NaN)  {
	    alert("please enter a valid spacing in inches")
	} else {

	    var curSelectedObjects = this.state.canvas.getActiveObjects();
	    if (curSelectedObjects) {
		curSelectedObjects.sort(function(a, b) {
		    return a.left - b.left;
		});
		var currentLeft = curSelectedObjects[0].left; // ok because if curSelectedObject isn't null, it has at least one item. 
		curSelectedObjects.map(function(obj) {
		    obj.left = currentLeft;
		    currentLeft += obj.width + spacing;
		    obj.setCoords();
		});
		this.context.mixpanel.track('space horizontally', { 'id': this.state.id, 'spacing': spacing });
		this.state.canvas.renderAll();
		this.saveState.bind(this)()
	    }
	}
	
    }

    deleteSelectedObjects() {
	var curSelectedObjects = this.state.canvas.getActiveObjects();
	if (curSelectedObjects) {
	    var t = this
	    curSelectedObjects.map(function(obj) { t.state.canvas.remove(obj) })
	    this.context.mixpanel.track('delete instrument', { 'id': this.state.id });
	    this.state.canvas.renderAll();
	    this.saveState.bind(this)()
	}
    }

    make() {
	this.context.mixpanel.track('make', { 'id': this.state.id });
	this.props.messageTeam("make" + this.state.id)
    }
    
    render() {

        if (process.title != "browser") {
            return null
	}
	
        return (
	    
		<div className="container">
		<div className="row toolBox">
		
                <div className="tool">
	        <button
            type="button"
            onClick={ this.alignSelectedObjectsVertically.bind(this) }
            className="btn btn-primary">
                Align Vertically
            </button>
		</div>

	     <div className="tool">
		<button
            type="button"
            onClick={ this.alignSelectedObjectsHorizontally.bind(this) }
            className="btn btn-primary">
                Align Horizontally
            </button>
		</div>
		
  <div className="tool">
	
	    
		<button
            type="button"
            onClick={ this.centerSelectedObjects.bind(this) }
            className="btn btn-primary">
                Center in Panel
            </button>
		</div>

	   
	<div className="tool tool-spacing-vertically input-group">
  
		<input type="text" className="form-control"
	     ref={elem => this.verticalSpacing = elem}
	    placeholder="Spacing" />

		<span className="input-group-btn">
		<button className="btn btn-primary" type="button"
	    onClick={ this.spaceSelectedObjectsRegularlyVertically.bind(this) }
		>Spread Vertically</button>
		</span>
	
	    </div>
		
		<div className="tool tool-spacing-horizontally input-group">
  
		<input type="text" className="form-control"
	     ref={elem => this.horizontalSpacing = elem}
	    placeholder="Spacing" />

		<span className="input-group-btn">
		<button className="btn btn-primary" type="button"
	    onClick={ this.spaceSelectedObjectsRegularlyHorizontally.bind(this) }>
		Spread Horizontally</button>
		</span>
	
	    </div>

	     

	      <div className="tool">
	
		<button
            type="button"
            onClick={ this.deleteSelectedObjects.bind(this) }
            className="btn btn-primary">
                Delete
            </button>

	    </div>

	    
	      <div className="tool">
	
		<button
            type="button"
            onClick={ this.make.bind(this) }
            className="btn btn-success">
                Make
            </button>

	    </div>
		
	        </div>
		

	    
		<div className="row fullPageRow">

		<div className="col-4">

                <InstrumentPicker
            catalog={this.state.catalog}
            addInstrument={this.addInstrument.bind(this)} />

	    </div>
		
		<div className="col-8 fullPageCol"
	    ref={elem => this.canvasContainer = elem}>
                <canvas id="canvas" className="canvas"></canvas>
		
	    </div>
		
	    </div>
		</div>
		
        );

    }
    
}


PanelEditor.contextTypes = {
    mixpanel: PropTypes.object.isRequired,
    cookies: PropTypes.object.isRequired,
    history: React.PropTypes.shape({
	push: React.PropTypes.func.isRequired
    })
};


