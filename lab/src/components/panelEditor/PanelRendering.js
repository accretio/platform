'use strict';
import React, { PropTypes} from 'react';
import { Link } from 'react-router';

import CSG from '@jscad/csg';
import { primitives3d, booleanOps } from '@jscad/scad-api';

const Viewer = require('./../../../OpenJSCAD.org/src/ui/viewer/jscad-viewer');

export default class PanelRendering extends React.Component {

    generateRandomScad() {

        const {cube, sphere} = primitives3d;
        const {union} = booleanOps;
        var base = cube({size: 1, center: true});
        var top = sphere({r: 10, fn: 100, type: 'geodesic'});
        var result = union(base, top);
        
    }
    
    componentDidMount() {
        this.generateRandomScad();
        // var viewer = new Viewer({});

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
