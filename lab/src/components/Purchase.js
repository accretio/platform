'use strict';

import React from 'react';

export default class Purchase extends React.Component {
    constructor(props) {
        super(props);
        this.state = { recipe: null };
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
    
    updateArg(arg, event) {
        var order = (this.state.order != null) ? JSON.parse(JSON.stringify(this.state.order)) : { args: [] }; 
        order.args.push({ key: arg, value: event.target.value });
        this.setState({ order: order });
        return true;
    }
    
    render() {
        if (this.state.recipe == null) {
            return (null);
        }

        var customize = null;

        var allArgs = this.state.recipe.steps.map(function(step) { return step.args; });

        var args = [].concat.apply([], allArgs);

        if (args.length > 0) {
            var t = this; 
            var argsInputs =
                    args.map(function(arg, pos) {
                        return(
                            <div className="form-group row" key={pos}>
                              <label className='col-2 col-form-label'>{arg}</label>
                              <div className="col-10">
                                <input className="form-control" onChange={t.updateArg.bind(t, arg)} type="text" id={arg} />
                              </div>
                            </div>);
                    });
                   
            customize =
                <div className="container customize">
                <h3>Customize</h3>
                <form>
                { argsInputs }
            </form></div>;
        }
        
        return(
            <div className="purchase">

              <h2>Purchase {this.state.recipe.name}</h2>
              { customize }
            </div>
        );
    }
}
