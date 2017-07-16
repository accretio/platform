'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import InstrumentPicker from './panelEditor/InstrumentPicker';
import PanelRendering from './panelEditor/PanelRendering';
import Instrument from './../models/Instrument.js';
import Processor2 from './../../OpenJSCAD.org/src/jscad/processor';

// the layouts
import { PA_23_250_E_Turbo_layout } from './../panels/PA-23-250-E-Turbo.js';

// the instruments
import { GTX345 } from './../catalog/GTX345.js';



export default class PanelEditor extends React.Component {

    constructor(props) {

        super(props);
        
        this.state = {
            layout: PA_23_250_E_Turbo_layout,
            catalog: [ GTX345 ],
            instruments: [],
            viewer: null
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
        var processor = new Processor2(this.refs.viewer);
        processor.setCurrentObjects([this.state.layout.shape]);
        this.setState({ processor: processor });
    }

    addInstrument(instrument) {
        var instruments = JSON.parse(JSON.stringify(this.state.instruments));
        instruments.push(instrument);
        this.setState({ instruments: instruments });
        // now we need to render that new instrument somehow
        var objects = instruments.map(function(instr){ return instr.shape; });
        objects.push(this.state.layout.shape);
                                      
        this.state.processor.setCurrentObjects(objects);
        
    } 
    
    render() {

        
        return (
            <div className="container">
              <div className="row">
                <div className="col-1">
                  <InstrumentPicker
                     catalog={this.state.catalog}
                     addInstrument={this.addInstrument.bind(this)}
                     />
                </div>
                <div className="col-11 viewer" ref="viewer">
                  
                </div> 
              </div>
            </div>
        );
    }
    
}

PanelEditor.contextTypes = {
    mixpanel: PropTypes.object.isRequired
};
