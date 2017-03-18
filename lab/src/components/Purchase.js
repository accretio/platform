'use strict';

import React from 'react';
import Modal from 'react-modal';
import StripeCheckout from 'react-stripe-checkout';


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
        var order = (this.state.order != null) ? JSON.parse(JSON.stringify(this.state.order)) : { args: [] }; 
        order.args.push({ key: arg, value: event.target.value });
        this.setState({ order: order });
        return true;
    }

    updateOrder(field, event) {
        var order = (this.state.order != null) ? JSON.parse(JSON.stringify(this.state.order)) : { args: [] };
        order[field] = event.target.value;
        return true;
    }
    
    onToken(token) {
        var order =
                {
                    token: token,
                    recipe: this.state.recipe,
                    order: this.state.order
                };
        fetch('/api/order', {
            method: 'POST',
            headers: new Headers({
	        'Content-Type': 'application/json'
            }),
            body: JSON.stringify(order)
        }).then(this.handleErrors.bind(this))
            .then(function(response) {
                alert("ok"); 
            });
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

        var shipping =
                <div className="container shipping">
                <h3>Shipping details</h3>
                <form>
                <div className="form-group row">
                  <label className='col-2 col-form-label'>Name</label>
                  <div className="col-10">
                   <input className="form-control" type="text" onChange={this.updateArg.bind(this, 'name')} />
                   </div>
            </div>


           <div className="form-group row">
                  <label className='col-2 col-form-label'>Street</label>
                  <div className="col-10">
                   <input className="form-control" type="text" onChange={this.updateArg.bind(this, 'street')} />
                   </div>
            </div>

            <div className="form-group row">
                  <label className='col-2 col-form-label'>City</label>
                  <div className="col-6">
                   <input className="form-control" type="text" onChange={this.updateArg.bind(this, 'city')} />
                   </div>
           <label className='col-2 col-form-label'>Zipcode</label>
                  <div className="col-2">
            <input className="form-control" type="text" onChange={this.updateArg.bind(this, 'zipcode')} />
                   </div>
            </div>

            </form>
            </div>;


        var payment =
                <div className="payment-box">
                <StripeCheckout
        name={this.state.recipe.name}
        description={this.state.recipe.description}
        token={this.onToken.bind(this)}
        amount={this.state.recipe.price * 100}
        stripeKey="pk_test_KNYK2I1UsxoIXX0jDiG46mmj"
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
              { shipping }
              { payment }
            </div>
        );
    }
}
