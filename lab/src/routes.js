'use strict';

import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import PanelEditor from './components/PanelEditor';
import NotFoundPage from './components/NotFoundPage';
import SelectLayout from './components/SelectLayout';

const routes = (
	<Route path="/" component={Layout}>

        	<IndexRoute component={LandingPage}/>
	        <Route path="/layout" component={SelectLayout} />
	        <Route path="/panel/:id" component={PanelEditor} />
        	<Route path="*" component={NotFoundPage}/>
	
        </Route>
);
 
export default routes; 

