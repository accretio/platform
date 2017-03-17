'use strict';

import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';

import ImportSingleOpenScadFile from './components/ImportSingleOpenScadFile';

import NotFoundPage from './components/NotFoundPage';
import Recipe from './components/Recipe';

const routes = (
  <Route path="/" component={Layout}>
    <IndexRoute component={LandingPage}/>
    <Route path="/import/" component={Layout}>
        <Route path="importSingleOpenScadFile" component={ImportSingleOpenScadFile}/>
    </Route>
    <Route path="/recipe/:id" component={Recipe}/>
    <Route path="*" component={NotFoundPage}/> 
  </Route>
    
);

export default routes; 

