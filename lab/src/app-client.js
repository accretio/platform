'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import AppRoutes from './components/AppRoutes';
import mixpanel from 'mixpanel-browser';
import MixpanelProvider from 'react-mixpanel';
import {mixpanel_token, bypass_https} from './config';

window.onload = () => {
    if (location.protocol != 'https:' && !bypass_https)
    {
        location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
    } else {
        mixpanel.init(mixpanel_token);
        ReactDOM.render(<MixpanelProvider mixpanel={mixpanel}>
                        <AppRoutes />
                        </MixpanelProvider>, document.getElementById('main'));
    }
};
