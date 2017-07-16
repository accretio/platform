'use strict';
import React, { PropTypes} from 'react';
import { Link } from 'react-router';

import Instrument from './../../models/Instrument.js';

const Viewer = require('./../../../OpenJSCAD.org/src/ui/viewer/jscad-viewer');

export default class PanelRendering extends React.Component {
    
    constructor(props) {
        super(props);
    }
    
    componentDidMount() {
        var v = new Viewer(this.refs.col1, {});
    }
    
    render() {
        return (
            <div className="panel-rendering">
              <div className="viewer" ref="col1" />
            </div>
        );
    }
    
}

PanelRendering.contextTypes = {
    mixpanel: PropTypes.object.isRequired
};
