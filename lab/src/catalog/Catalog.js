'use strict';

import { GTX345 } from './GTX345.js';
import { GNS430 } from './GNS430.js';
import { ROUND3125 } from './ROUND3125.js';

const catalog =
    [ GTX345, GNS430, ROUND3125 ]

function findInstrument(name) {
    console.log("looking for instrument " + name)
    // inefficient but fine for now
    return (catalog.find(function(instrument) { return (instrument.name == name) }))
}

module.exports = {
    catalog, findInstrument
}
