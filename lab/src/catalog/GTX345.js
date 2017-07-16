import Instrument from './../models/Instrument.js';
import { primitives3d, booleanOps } from '@jscad/scad-api';

const {cube, sphere} = primitives3d;

var shape = cube({ size: [ 40, 200, 50 ], center: true});
                    
var GTX345 = new Instrument("GTX 345", shape);

module.exports = {
    GTX345 
}
