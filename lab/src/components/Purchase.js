'use strict';

// http://localhost:3333/product/AVrjyWwvYiWPzcptPrkx/

import React from 'react';
import Modal from 'react-modal';
import StripeCheckout from 'react-stripe-checkout';

import {stripe_pk} from '../myconfig';
import fetch from 'isomorphic-fetch';

export default class Purchase extends React.Component {
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
    
    updateArg(arg, event) {
        
        var order = (this.state.order != null) ? JSON.parse(JSON.stringify(this.state.order)) : { args: new Array() };
        
        var pos = order.args.findIndex(function(v) { return(v.key === arg);});

        if (pos > -1) {
            order.args[pos] = event.target.value;
        } else {
            order.args.push({ key: arg, value: event.target.value });
        }
        
        this.setState({ order: order });
      
        return true;
    }
    
    onToken(token) {
        var order =
                {
                    token: token,
                    recipe: this.state.recipe,
                    job: this.state.order
                };
        fetch('/api/createOrder', {
            method: 'POST',
            headers: new Headers({
	        'Content-Type': 'application/json'
            }),
            body: JSON.stringify(order)
        }).then(this.handleErrors.bind(this))
            .then(this.gotoThanks.bind(this));
    }

    gotoThanks() {
        this.props.history.push('/product/' + this.props.params.id + '/thanks');
    }
    
    handleErrors(response) {
        if (!response.ok) {
            this.setState({ error: response.statusText });
            throw Error(response.statusText);
        }
        return response;
    }

    setError(error) {
        this.setState({ error: error });
    }

    resetError() {
        this.setState({ error: '' }); 
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
                <h3>Customization</h3>
                <form>
                { argsInputs }
            </form></div>;
        } 
       
        var payment =
                <div className="payment-box">
                <StripeCheckout
        shippingAddress={true}
        billingAddress={true}
        name={this.state.recipe.name}
        description={this.state.recipe.description}
        token={this.onToken.bind(this)}
        amount={this.state.recipe.price * 100}
        stripeKey={stripe_pk}
        label="Purchase via Stripe"
            /></div> ;


        // todo: make this a mxin?

        const customStyles = {
            overlay : {
                position          : 'fixed',
                top               : 0,
                left              : 0,
                right             : 0,
                bottom            : 0,
                backgroundColor   : 'rgba(255, 255, 255, 0.75)'
            },
            content : {
                position                   : 'absolute',
                top                        : '40px',
                left                       : '40px',
                right                      : '40px',
                bottom                     : '40px',
                border                     : 'none',
                background                 : '',
                overflow                   : 'auto',
                WebkitOverflowScrolling    : 'touch',
                borderRadius               : '4px',
                outline                    : 'none',
                padding                    : '20px'

            }
           } ;
        
         let modal =
                <Modal isOpen={this.state.error != ''}
        className=""
        style={customStyles}
        contentLabel="Error">

            <div className="modal-dialog" role="document">
            <div className="modal-content">
            <div className="modal-header">
            <h5 className="modal-title">Error</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.resetError.bind(this)}>
            <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <div className="modal-body">
            <p>{this.state.error}</p>
            </div>
            <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.resetError.bind(this)}>Close</button>
            </div>
            </div>
            </div>

            </Modal> ;

        return(
            
            <div className="purchase">
              { modal }
              <h2>Purchase {this.state.recipe.name}</h2>
              { customize }
              { payment }
            </div>
        );
    }
}
