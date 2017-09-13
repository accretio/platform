'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import InstrumentPicker from './panelEditor/InstrumentPicker';
import PanelRendering from './panelEditor/PanelRendering';
import Instrument from './../models/Instrument.js';
import Processor2 from './../../OpenJSCAD.org/src/jscad/processor';
import { instanceOf } from 'prop-types';
import { CookiesProvider, withCookies, Cookies } from 'react-cookie';


import {fabric} from 'fabric';


import { primitives3d, booleanOps } from '@jscad/scad-api';

import { parseString, toSVG } from 'dxf-to-svg/lib';

// the layouts
import { PA_23_250_E_Turbo_layout } from './../panels/PA-23-250-E-Turbo.js';

// the instruments
import { GTX345 } from './../catalog/GTX345.js';
import { GNS430 } from './../catalog/GNS430.js';
import { ROUND3125 } from './../catalog/ROUND3125.js';

// the panels
import { PA28 } from './../aircraft/PA40.js'; 

var DESIGN = 0;
var RENDER = 1;

export default class PanelEditor extends React.Component {
    
    constructor(props) {

        super(props);
        
        this.state = {
            layout: PA_23_250_E_Turbo_layout,
            catalog: [ GTX345, GNS430, ROUND3125 ],
            instruments: [],
            viewer: null,
            canvas: null,
            renderingMode: DESIGN
        };

        
        
    }

    resizeCanvasContainer() {
	console.log("resizing the canvas");
	var canvas = this.state.canvas
	canvas.setWidth(this.canvasContainer.clientWidth);
	canvas.setHeight(this.canvasContainer.clientHeight);
	canvas.setZoom(canvas.width / this.state.aircraftTemplateWidth);
	canvas.calcOffset(); 
	canvas.renderAll();
	canvas.calcOffset();  
    }

    componentDidMount() {
        this.context.mixpanel.track('panel editor page loaded');

	// get the current panel from the cookies

	console.log(this.context.cookies.get('name'))

	var n = this.context.cookies.get('name');
	this.context.cookies.set('name', 'william')
	
	var this_ = this;
	
	var parsed = parseString(PA28);
	console.log(parsed)
	var svg = toSVG(parsed);
	
        var canvas = new fabric.Canvas('canvas');
	
	canvas.setWidth(this.canvasContainer.clientWidth);
	canvas.setHeight(this.canvasContainer.clientHeight);
	
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
	    this_.setState({ aircraftTemplateWidth: loadedObjects.width});
	    canvas.setZoom(canvas.width / loadedObjects.width);
            canvas.renderAll();

        },function(item, object) {
                object.set('id',item.getAttribute('id'));
                group.push(object);
        });

	// set up pan zoom

	this.canvasContainer.addEventListener("mousewheel", this.zoomCanvas.bind(this));
        this.setState({ canvas: canvas });


	// we need to resize the canvas container
	
	this.resizeCanvasContainer.bind(this);
	window.addEventListener("resize", this.resizeCanvasContainer.bind(this));

	// we number elements by selection order. it comes handy when computing
	// the pivot in alignment function

	var counter = 0; 
	canvas.on('object:selected', function(options) {
	    counter += 1;
	    options.target.selectionCounter = counter; 
	});
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

    renderPanel() {
        var objects = this.state.instruments.map(function(instr){ return instr.shape; });
   
      /*  const {union, difference} = booleanOps;

        if (this.state.renderingMode == SEE_ALL) {
            var allinstrs = union(objects);
            var u = union(this.state.layout.shape, allinstrs);
            
            this.state.processor.setCurrentObjects(new Array(u));
        } else if (this.state.renderingMode == PANEL_CUT) {
            var allinstrs = union(objects);
            var diff = difference(this.state.layout.shape, allinstrs);
            this.state.process.setCurrentObjects(diff);
        } */
        
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

	this.state.canvas.add(s);
	
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
	    this.state.canvas.renderAll();
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
	     this.state.canvas.renderAll();
	 }
	 
     }

     centerSelectedObjects() {
	 
	 var center = this.state.aircraftTemplateWidth / 2;

	 var obj = this.state.canvas.getActiveObject();

	 if (obj) {
	     console.log("set left to " + center);
	     obj.left = center - (obj.width / 2);
	     obj.setCoords();
	     this.state.canvas.renderAll();
	 }
	 	     
     }

    spaceSelectedObjectsRegularlyVertically() {
	var spacing = 1; // inches
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
	    this.state.canvas.renderAll();
	}
	
    }

      spaceSelectedObjectsRegularlyHorizontally() {
	var spacing = 1; // inches
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
	    this.state.canvas.renderAll();
	}
	
    }
    
    render() {

           
        
        return (
	  
		<div className="container">
                     <div className="designControls">
	          	 <button
                           type="button"
            onClick={ this.alignSelectedObjectsVertically.bind(this) }
            className="btn btn-primary">
                Align Vertically
            </button>

	     <button
             type="button"
            onClick={ this.alignSelectedObjectsHorizontally.bind(this) }
            className="btn btn-primary">
                Align Horizontally
            </button>
		 <button
             type="button"
            onClick={ this.centerSelectedObjects.bind(this) }
            className="btn btn-primary">
                Center Horizontally
            </button>
			 <button
             type="button"
            onClick={ this.spaceSelectedObjectsRegularlyVertically.bind(this) }
            className="btn btn-primary">
                Space Vertically Regularily
            </button>
			 <button
             type="button"
            onClick={ this.spaceSelectedObjectsRegularlyHorizontally.bind(this) }
            className="btn btn-primary">
                Space Horizontally Regularily
        </button> 
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
    cookies: PropTypes.object.isRequired
};


