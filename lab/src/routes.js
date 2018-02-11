'use strict';

import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import NotFoundPage from './components/NotFoundPage';
import ShareExperience from './components/ShareExperience';
import ReviewDestinations from './components/ReviewDestinations';
import ManageAirfields from './components/ManageAirfields';
import Experience from './components/Experience';
import ListExperiences from './components/ListExperiences';


const routes = (
	<Route path="/" component={Layout}>

        <IndexRoute component={LandingPage}/>
	<Route path="/experience/:id(/:edit)" component={Experience} />
	<Route path="/shareExperience" component={ShareExperience} />
	<Route path="/reviewDestinations" component={ReviewDestinations} />
	<Route path="/manageAirfields" component={ManageAirfields} />
	<Route path="/admin/experiences" component={ListExperiences} />

	<Route path="*" component={NotFoundPage}/>
	
        </Route>
);
 
export default routes; 

