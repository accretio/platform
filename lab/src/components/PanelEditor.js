'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import InstrumentPicker from './panelEditor/InstrumentPicker';
import PanelRendering from './panelEditor/PanelRendering';
import Instrument from './../models/Instrument.js';
import Processor2 from './../../OpenJSCAD.org/src/jscad/processor';

import { primitives3d, booleanOps } from '@jscad/scad-api';

// the layouts
import { PA_23_250_E_Turbo_layout } from './../panels/PA-23-250-E-Turbo.js';

// the instruments
import { GTX345 } from './../catalog/GTX345.js';
import { GNS430 } from './../catalog/GNS430.js';

var PANEL_CUT = 1;
var SEE_ALL = 0;

export default class PanelEditor extends React.Component {

    constructor(props) {

        super(props);
        
        this.state = {
            layout: PA_23_250_E_Turbo_layout,
            catalog: [ GTX345, GNS430 ],
            instruments: [],
            viewer: null,
            renderingMode: SEE_ALL
        };

        this.opts = {
            debug: true,
            libraries: [],
            openJsCadPath: '',
            useAsync: true,
            useSync: true,
            processor: {}
        };
        
    }

    componentDidMount() {
        this.context.mixpanel.track('panel editor page loaded');
        var processor = new Processor2(this.refs.viewer, this.opts);
        processor.setCurrentObjects([this.state.layout.shape]);
        this.setState({ processor: processor });
    }

    renderPanel() {
        var objects = this.state.instruments.map(function(instr){ return instr.shape; });
   
        const {union, difference} = booleanOps;

        if (this.state.renderingMode == SEE_ALL) {
            var allinstrs = union(objects);
            var u = union(this.state.layout.shape, allinstrs);
            
            this.state.processor.setCurrentObjects(new Array(u));
        } else if (this.state.renderingMode == PANEL_CUT) {
            var allinstrs = union(objects);
            var diff = difference(this.state.layout.shape, allinstrs);
            this.state.process.setCurrentObjects(diff);
        }
        
    }
    
    addInstrument(instrument) {
        var instruments = JSON.parse(JSON.stringify(this.state.instruments));
        instruments.push(instrument);
        this.setState({ instruments: instruments });
        
        // now we need to render that new instrument somehow
        this.renderPanel();
    }

   
    seeAll() {
        this.setState({ renderingMode: SEE_ALL });
        
    }

    panelCut() {
        this.setState({ renderingMode: PANEL_CUT });
    }
    
    render() {

        return (
            <div className="container">

              <div className="row controls">
                <div className="col-12">
                   <button
                      type="button"
                      onClick={ this.seeAll.bind(this) }
                      className="btn btn-primary">
                     See all
                   </button>
                     <button
                      type="button"
                      onClick={ this.panelCut.bind(this) }
                      className="btn btn-primary">
                     Panel Cut
                   </button>
                </div>
              </div>
              
              <div className="row row-1">
                <div className="col-2">
                  <InstrumentPicker
                     catalog={this.state.catalog}
                     addInstrument={this.addInstrument.bind(this)} />
                </div>
                <div className="col">
                  <div className="viewer" ref="viewer">
                  </div> 
                </div>
              </div>
            </div>
        );

    }
    
}

PanelEditor.contextTypes = {
    mixpanel: PropTypes.object.isRequired
};


