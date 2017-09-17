import Instrument from './../models/Instrument.js';
import {fabric} from 'fabric';

function factory(name, width, height) {
    return(new Instrument(name, function() {
	return (new fabric.Rect({
	    top : 0,
	    left : 0,
	    width : width,
	    height : height,
	    hasControls : false,
	    fill : 'blue'
	}))
    }));
}


var GTX345 = factory("GTX 345", 6.30, 1.65)
var GTX335 = factory("GTX 335", 6.30, 1.68)
var GNS430 = factory("GNS 430", 6.25, 2.65)
var GNS530 = factory("GNS 530", 6.25, 4.60)
var GTN650 = factory("GTN 650", 6.25, 2.65)
var GTN750 = factory("GTN 750", 6.25, 6.00)
var G500 = factory("G500/G600", 10.00, 6.70)

module.exports = {
    GTX345, GTX335, GNS430, GNS530, GTN650, GTN750, G500
}
