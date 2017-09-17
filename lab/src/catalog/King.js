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
	    fill : '#5cb85c'
	}))
    }));
}


var KX170 = factory("KX 170/175", 6.25, 2.5)
var KN64 = factory("KN 64", 6.3, 1.3)

module.exports = {
    KX170, KN64
}
