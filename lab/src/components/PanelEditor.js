'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import InstrumentPicker from './panelEditor/InstrumentPicker';
import PanelRendering from './panelEditor/PanelRendering';
import Instrument from './../models/Instrument.js';
import Processor2 from './../../OpenJSCAD.org/src/jscad/processor';


import {fabric} from 'fabric';


import { primitives3d, booleanOps } from '@jscad/scad-api';

import { parseString, toSVG } from 'dxf-to-svg/lib';

// the layouts
import { PA_23_250_E_Turbo_layout } from './../panels/PA-23-250-E-Turbo.js';

// the instruments
import { GTX345 } from './../catalog/GTX345.js';
import { GNS430 } from './../catalog/GNS430.js';

// the panels
import { PA28 } from './../aircraft/PA40.js'; 

var DESIGN = 0;
var RENDER = 1;

export default class PanelEditor extends React.Component {

    constructor(props) {

        super(props);
        
        this.state = {
            layout: PA_23_250_E_Turbo_layout,
            catalog: [ GTX345, GNS430 ],
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
	canvas.renderAll();
    }

    componentDidMount() {
        this.context.mixpanel.track('panel editor page loaded');
      /*  var processor = new Processor2(this.refs.viewer, this.opts);
        processor.setCurrentObjects([this.state.layout.shape]);
       this.setState({ processor: processor }); */

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


        var rect = new fabric.Rect({
            top : 0,
            left : 0,
            width :  6.25,
            height : 2.65,
            hasControls : false,
            fill : 'blue'
        });
        
        this.state.canvas.add(rect);
       
    }

   
    viewDesign() {
        this.setState({ renderingMode: DESIGN });
        
    }

    viewRender() {
        this.setState({ renderingMode: RENDER });
    }

    alignSelectedObjectsVertically() {

        var curSelectedObjects = new Array();
        curSelectedObjects = this.state.canvas.getObjects(this.state.canvas.getActiveGroup);

        var averageLeft =
                curSelectedObjects.map(function(obj){ return obj.left ; }).reduce(function(a,b) { return (a+b);}, 0) / curSelectedObjects.length ;
        
        curSelectedObjects.map(function(obj) { obj.top = averageLeft; obj.setCoords(); });

        this.state.canvas.renderAll();
    }
    
    render() {

        let renderOptions = null;

	if (this.state.renderMode == DESIGN) {
            renderOptions =
                <div className="col-12">

                </div>;
        } else {
            renderOptions =
                <div className="col-12">
                <button
            type="button"
            onClick={ this.alignSelectedObjectsVertically.bind(this) }
            className="btn btn-primary">
                Align Vertically
                </button>
                </div>;
        }
        
        return (
	  
		<div className="container">

		     <div className="row fullPageRow">

		         <div className="col-4">

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
    mixpanel: PropTypes.object.isRequired
};


