'use strict';

import React, { PropTypes} from 'react';
import { Link } from 'react-router';
import InstrumentPicker from './panelEditor/InstrumentPicker';
import PanelRendering from './panelEditor/PanelRendering';

export default class PanelEditor extends React.Component {

    componentDidMount() {
        this.context.mixpanel.track('panel editor page loaded');
    }


    render() {

        return (
            <div className="row">
              <div className="col">
                <InstrumentPicker />
              </div>
              <div className="col">
                <PanelRendering />
              </div>
           </div>
    );
  }
}

PanelEditor.contextTypes = {
    mixpanel: PropTypes.object.isRequired
};
