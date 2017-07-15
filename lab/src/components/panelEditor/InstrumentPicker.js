'use strict';
import React, { PropTypes} from 'react';
import { Link } from 'react-router';

export default class InstrumentPicker extends React.Component {

    render() {

        return (
            <div>
              instrumentPicker
           </div>
    );
  }
}

InstrumentPicker.contextTypes = {
    mixpanel: PropTypes.object.isRequired
};
