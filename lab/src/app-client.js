'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import AppRoutes from './components/AppRoutes';

window.onload = () => {
    if ((location.protocol != 'https:') && (process.env.NODE_ENV === 'production'))
    {
        location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
    } else {
        ReactDOM.render(<AppRoutes />, document.getElementById('main'));
    }
};
