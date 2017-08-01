import Instrument from './../models/Instrument.js';
import { primitives3d, booleanOps } from '@jscad/scad-api';

const {cube, sphere} = primitives3d;

var shape = cube({ size: [ 40, 40, 20 ], center: true});
                    
var GNS430 = new Instrument("GNS 430", shape);

module.exports = {
    GNS430 
}
