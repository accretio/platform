'use strict';

import React from 'react';
import Modal from 'react-modal';
import fetch from 'isomorphic-fetch';

export default class OrdersSearch extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = { results: [], query: '' };
    }

    runSearch(event) {
        fetch('/api/admin/search', {
          method: 'post',
          headers: new Headers({
	      'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ query: this.state.query }) 
        }).then(function(response) { return (response.json()) ; })
            .then(this.updateResults.bind(this));
        
        if (event) {
            event.preventDefault();
        }
    }

    updateResults(results) {
        this.setState({ results: results.hits.hits });
    }
    
    updateQuery(event) {
        this.setState({ query: event.target.value });
    }

    updateOrder(id, status) {
        fetch('/api/updateOrder', {
            method: 'post',
            headers: new Headers({
	        'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ id: id, doc: { status: status }}) 
        }).then(function(response) { return (response.json()) ; })
          .then(this.runSearch.bind(this));
    }

    chargeOrder(id) {
        fetch('/api/chargeOrder', {
            method: 'post',
            headers: new Headers({
	        'Content-Type': 'application/json'
            }),
            body: JSON.stringify({ id: id }) 
        }).then(function(response) { return (response.json()) ; })
          .then(this.runSearch.bind(this));
    }
    
    render() {

        let searchbox =
                <div className="searchbox container-fluid">
              
                <form onSubmit={this.runSearch.bind(this)}>
                  <div className="form-group row">
                <div className="col-8">
                <input className='form-control' type='text' onChange={this.updateQuery.bind(this)} />
                </div>
            <div className="col-4">
             <button type="submit" className="btn btn-primary">Search</button>
                </div>
                <div>
            </div>
             </div>
            </form>
            
             </div>
            ;

        var t = this;
        let orders =
                this.state.results.map(function(result, pos) {

                    if (result._source.recipe == null) {
                        return null; 
                    }
                    
                    var status = "pending";
                  
                    if (result._source.status != null) {
                        status = result._source.status;
                    }

                    var controls = null; 
                    if (status == "pending") {
                        controls = Array(<div className="col-2" key="34">
                                         <button className="btn" onClick={t.chargeOrder.bind(t, result._id)}>Charge</button>
                                         </div>,
                                         <div className="col-2" key="35">
                                           <button className="btn" onClick={t.updateOrder.bind(t, result._id, 'deleted')}>Delete</button>
                                         </div>);
                    } else if (status == "charged") {
                        controls = <div className="col-2 ">
                            <button className="btn" onClick={t.updateOrder.bind(t, result._id, 'started')}>Start</button>
                            </div>;
                
                    }
                    
                    return(
                        <div className="row result" key={pos}>
                          
                          <div className="col-2">
                            { status }
                          </div>

                          <div className="col-3">
                            { result._source.recipe.name }
                          </div>

                          { controls }
                       


                        </div>
                    );

                });

        let results =
                <div className="container-fluid results">
                { orders }
                </div>;
        
        return(<div className="ordersSearch">
               { searchbox }
               { results }
               </div>);
    }
}
