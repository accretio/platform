'use strict';

import React from 'react';

import fetch from 'isomorphic-fetch';

export default class Thanks extends React.Component {
    constructor(props) {
        super(props);
        this.state = { recipe: null, error: ''};
        fetch('/api/getRecipe', {
            method: 'post',
            headers: new Headers({
	        'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ id: this.props.params.id }) 
        }).then(function(response) { return (response.json()) ; }, this.updateError.bind(this))
            .then(this.updateRecipe.bind(this), this.updateError.bind(this));
    }

    updateRecipe(recipe) {
        this.setState({ recipe: recipe });
    }
    
    updateError(error) {
        console.log(error);
        this.setState({ error: error });
    }
    
    render() {
        return (<div className="thanks">
                <div className="card text-center">
                
                <div className="card-block">
                <h4 className="card-title">Thanks</h4>
                <p className="card-text">Your order will soon be on the way</p>
                </div>
                
                </div>
                </div>);
    }
}
