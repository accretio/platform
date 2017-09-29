import { layoutIndex, layoutType } from '../store/es.js'

import { parseString, toSVG } from '../dxf/lib/index.js';

// the panels
import { PA28 } from './../aircraft/PA28.js';
import { C441_center } from './../aircraft/C441_center.js';
import { C441_left } from './../aircraft/C441_left.js';
import { C441_right } from './../aircraft/C441_right.js';
import { RV14_left, RV14_center, RV14_right } from './../aircraft/RV14.js';
import { RV10 } from './../aircraft/RV10.js';
import { RV8 } from './../aircraft/RV8.js';



var layouts = [

    { name: "PA-28",
      dxf: PA28,
      breakpoints: [] },

    { name: "C421/425/441_Center_Panel",
      dxf: C441_center,
      breakpoints: [] },

    { name: "C421/425/441_Left_Panel",
      dxf: C441_left,
      breakpoints: [] },
     
    { name: "C421/425/441_Right_Panel",
      dxf: C441_right,
      breakpoints: [] },

    { name: "RV10",
      dxf: RV10,
      breakpoints: [] },

    { name: "RV8/8A",
      dxf: RV8,
      breakpoints: [] },
    
    { name: "RV14_Left_Panel",
      dxf: RV14_left,
      breakpoints: [] },
    
    { name: "RV14_Center_Panel",
      dxf: RV14_center,
      breakpoints: [] },
    
    { name: "RV14_Right_Panel",
      dxf: RV14_right,
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
