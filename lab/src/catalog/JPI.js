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


var JPI790 = factory("JPI 790", 4.81, 3.47)

module.exports = {
    JPI790
}
