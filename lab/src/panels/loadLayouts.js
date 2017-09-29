/*

 */

import { layoutIndex, layoutType } from '../utils/esConfig.js'

import { parseString, toSVG } from '../dxf/lib/index.js';

// the panels
import { PA28 } from './../aircraft/PA40.js';

var layouts = [

    { id: 1,
      name: "PA-28",
      dxf: PA28,
      breakpoints: [] },

    { id: 2,
      name: "C441",
      dxf: "",
      breakpoints: [] }
    
];

function loadLayouts(ESClient) {

    layouts.map(function(layout) { 
	console.log("indexing layout " + layout.name)
	ESClient.index({
	    index: layoutIndex,
	    type: layoutType,
	    body: layout
	}).then(function (body) {
	    return ;
	});
    });
    
}

module.exports = {
    loadLayouts
}
