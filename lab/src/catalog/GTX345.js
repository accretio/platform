import Instrument from './../models/Instrument.js';
import {fabric} from 'fabric';

var factory = function() {
    return (new fabric.Rect({
	top : 0,
	left : 0,
	width : 6.30,
	height : 1.65,
	hasControls : false,
	fill : 'blue'
    }));
};
                    
var GTX345 = new Instrument("GTX 345", factory);

module.exports = {
    GTX345 
}
