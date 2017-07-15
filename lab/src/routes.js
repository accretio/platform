'use strict';

import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import PanelEditor from './components/PanelEditor';
import ImportSingleOpenScadFile from './components/ImportSingleOpenScadFile';
import Thanks from './components/Thanks';
import NotFoundPage from './components/NotFoundPage';
import Product from './components/Product';
import Purchase from './components/Purchase';

import AdminOrdersSearch from './components/admin/OrdersSearch';

const routes = (
   <Route path="/" component={Layout}>
    <IndexRoute component={PanelEditor}/>
    <Route path="/import/" component={Layout}>
        <Route path="importSingleOpenScadFile" component={ImportSingleOpenScadFile}/>
    </Route>
    <Route path="/product/:id/purchase" component={Purchase}/>
    <Route path="/product/:id/thanks" component={Thanks}/>
    <Route path="/product/:id" component={Product}/>
    <Route path="/admin/orders/search(/:q)" component={AdminOrdersSearch}/>  
        
    <Route path="*" component={NotFoundPage}/> 
  </Route>
    
);

export default routes; 

