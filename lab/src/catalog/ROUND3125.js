import Instrument from './../models/Instrument.js';

import {fabric} from 'fabric';

var factory = function() {
    return (new fabric.Circle({
        top : 0,
        left : 0,
	radius :  (3.125 / 2),
        hasControls : false,
        fill : 'blue'
    }));
}
                    
var ROUND3125 = new Instrument("ROUND 3.125", factory);

module.exports = {
    ROUND3125 
}
