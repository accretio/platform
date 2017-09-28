import { layoutIndex, layoutType } from '../store/es.js'

import { parseString, toSVG } from '../dxf/lib/index.js';

// the panels
import { PA28 } from './../aircraft/PA28.js';
import { C441_center } from './../aircraft/C441_center.js';
import { C441_left } from './../aircraft/C441_left.js';
import { C441_right } from './../aircraft/C441_right.js';


var layouts = [

    { name: "PA-28",
      dxf: PA28,
      breakpoints: [] },

    { name: "C441_Center_Panel",
      dxf: C441_center,
      breakpoints: [] },

    { name: "C441_Left_Panel",
      dxf: C441_left,
      breakpoints: [] },
     
    { name: "C441_Right_Panel",
      dxf: C441_right,
      breakpoints: [] }
    
];

function loadLayouts(ESClient) {

    layouts.map(function(layout) { 

	var insertLayout = function() {
	    console.log("inserting layout " + layout.name)
	    ESClient.index({
		    index: layoutIndex,
		    type: layoutType,
		    body: layout
	   }) 
	}
	
	ESClient.search({
	    index: layoutIndex,
            type: layoutType,
	    q: layout.name
	}).then(function(body) {
	    if (body.hits.total == 0)
		insertLayout()
	    else {
		Promise.resolve()
	    }
	}, insertLayout)

    })    

}

module.exports = {
    loadLayouts
}
