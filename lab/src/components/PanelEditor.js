'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import InstrumentPicker from './panelEditor/InstrumentPicker';
import PanelRendering from './panelEditor/PanelRendering';
import Instrument from './../models/Instrument.js';

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
            instruments: []
        };
    }

    componentDidMount() {
        this.context.mixpanel.track('panel editor page loaded');
    }

    addInstrument(instrument) {
        console.log(instrument);
        console.log("current instruments: " + this.state.instruments);
        var instruments = JSON.parse(JSON.stringify(this.state.instruments));
        instruments.push(instrument);
        this.setState({ instruments: instruments }); 
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
                <div className="col-11">
                  <PanelRendering instruments={this.state.instruments}/>
                </div> 
              </div>
            </div>
        );
    }
    
}

PanelEditor.contextTypes = {
    mixpanel: PropTypes.object.isRequired
};
