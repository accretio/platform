'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import AppRoutes from './components/AppRoutes';
import mixpanel from 'mixpanel-browser';
import MixpanelProvider from 'react-mixpanel';
import {mixpanel_token, bypass_https} from './config';
import {CookiesProvider} from 'react-cookie';
import './i18n';

window.onload = () => {
    if (location.protocol != 'https:' && !bypass_https)
    {
	location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
    } else {
        mixpanel.init(mixpanel_token);
        ReactDOM.render(<CookiesProvider>
			<MixpanelProvider mixpanel={mixpanel}>
                        <AppRoutes />
                        </MixpanelProvider></CookiesProvider>, document.getElementById('main'));
    }
};
