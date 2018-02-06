'use strict';

import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import NotFoundPage from './components/NotFoundPage';
import SuggestDestination from './components/SuggestDestination';
import ShareExperience from './components/ShareExperience';
import ReviewDestinations from './components/ReviewDestinations';
import ManageAirfields from './components/ManageAirfields';


const routes = (
	<Route path="/" component={Layout}>

        <IndexRoute component={LandingPage}/>
	<Route path="/suggestDestination" component={SuggestDestination} />
	<Route path="/shareExperience" component={ShareExperience} />
	<Route path="/reviewDestinations" component={ReviewDestinations} />
	<Route path="/manageAirfields" component={ManageAirfields} />
	<Route path="*" component={NotFoundPage}/>
	
        </Route>
);
 
export default routes; 

