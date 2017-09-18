'use strict';

import { GMA340, GTX345, GTX335, GNS430, GNS530, GTN650, GTN750, G500 } from './Garmin.js';
import { JPI790 } from './JPI.js'
import { KX170, KN64 } from './King.js'
import { ROUND3125 } from './ROUND3125.js';

const catalog =
      [ GMA340, GTX345, GTX335, GNS430, GNS530, GTN650, GTN750, G500,
	JPI790,
	KX170, KN64,
	ROUND3125 ]

function findInstrument(name) {
    console.log("looking for instrument " + name)
    // inefficient but fine for now
    return (catalog.find(function(instrument) { return (instrument.name == name) }))
}

module.exports = {
    catalog, findInstrument
}
