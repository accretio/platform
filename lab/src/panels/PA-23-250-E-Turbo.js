// Panel for a Turbo Aztec E

import Layout from "./../models/Layout.js";

import CSG from '@jscad/csg';
import { primitives3d, booleanOps } from '@jscad/scad-api';



const {cube, sphere} = primitives3d;

var base = cube({ size: [5, 180, 50], center: true });

var PA_23_250_E_Turbo_layout = new Layout("PA-23-250 E Turbo", base);

module.exports = {
  PA_23_250_E_Turbo_layout
};
