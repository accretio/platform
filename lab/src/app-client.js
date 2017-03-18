'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import AppRoutes from './components/AppRoutes';

// set up stripe
//var stripe = Stripe('pk_test_KNYK2I1UsxoIXX0jDiG46mmj');

window.onload = () => {
    ReactDOM.render(<AppRoutes />, document.getElementById('main'));
};
