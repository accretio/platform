'use strict';

import React from 'react';
import Slider from 'react-slick';

import fetch from 'isomorphic-fetch';

export default class Product extends React.Component {

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
    
    purchase() {
        this.props.history.push('/product/' + this.props.params.id + '/purchase');
    }
    
  render() {
    console.log("calling render with " + this.props.params.id + " ");
     
    if (this.state.recipe == null) {
      return null; 
    } else {

      

        var gallery = null ;
        if (this.state.recipe.gallery.length > 0) {
            var settings = {
                dots: true,
                infinite: true,
                speed: 5,
                slidesToShow: 1,
                slidesToScroll: 1
            };

            var contents = this.state.recipe.gallery.map(function (file, pos) {
                var url = "/api" + file.publicUrl;
                return(<div className="carrousel-img" key={pos}>
                       <img className="img-fluid img-thumbnail" src={url} alt="" />
                       </div>);
            });
            
            gallery=
                <Slider className="carrousel" {...settings}>
                
                { contents }
                </Slider>;
        };

        var buy = <button
        className="btn btn-success"
        onClick={this.purchase.bind(this)}>Purchase</button>;
        
        return (
            <div className="recipe">
              
              <h2> { this.state.recipe.name } </h2>

              <div className="container-fluid">
                <div className="row">
                  <div className="col-8">
                    { gallery }
                  </div>
                  <div className="col-4">
                    <div className="description">
                      { this.state.recipe.description }
                    </div>
                     <div className="material">
                       <b>Material:</b> { this.state.recipe.materials[0] }
                     </div>
                     <div className="price">
                       <b>Price:</b> $ { this.state.recipe.price }
                     </div>
                     <div className="buy">
                       { buy }
                     </div>
                  </div>
                </div>
              </div>
              
            </div>); 
    }
      
               
  }
}
