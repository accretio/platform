import Instrument from './../models/Instrument.js';
import {fabric} from 'fabric';

var shape = function() {
    return (new fabric.Rect({
	top : 0,
	left : 0,
	width :  6.25,
	height : 2.65,
	hasControls : false,
	fill : 'blue'
    }));
};
                    
var GNS430 = new Instrument("GNS 430", shape);

module.exports = {
    GNS430 
}
