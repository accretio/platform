'use strict';
import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import Instrument from './../../models/Instrument.js';


export default class InstrumentPicker extends React.Component {

    constructor(props) {
        super(props);
        console.log(props.catalog);
        this.state = {
            catalog: props.catalog
        };
     }

    addInstrument(instrument) {
        this.props.addInstrument(instrument);
    }
    
    render() {
        console.log("rendering the instrument picker");
        var that = this;
        var instruments =
                this.state.catalog.map(function(instrument, i) {
                    return <button
                    type="button"
                    key={ i }
                    className="btn btn-primary"
                    onClick={ function () { that.props.addInstrument(instrument); } } >
                        { instrument.name }
                    </button>; 
                });
        
        return (
            <div> { instruments } </div>
        );
  }
}

InstrumentPicker.contextTypes = {
    mixpanel: PropTypes.object.isRequired
};

InstrumentPicker.catalog = [];
