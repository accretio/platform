'use strict';

import React from 'react';

export default class Recipe extends React.Component {

  constructor(props) {
    super(props);
    this.state = { recipe: null }
    fetch('/api/getRecipe', {
      method: 'post',
      headers: new Headers({
	'Content-Type': 'application/json'
      }),
      body: JSON.stringify({ id: this.props.params.id }) 
    }).then(function(response) { return (response.json()) }, this.updateError.bind(this))
      .then(this.updateRecipe.bind(this), this.updateError.bind(this))
    
  }

  updateRecipe(recipe) {
    this.setState({ recipe: recipe })
  }

  updateError(error) {
    console.log(error);
    this.setState({ error: error })
  }
  render() {
    console.log("calling render with " + this.props.params.id + " ");

     
    if (this.state.recipe == null) {
      return null; 
    } else {
      return (<div className="recipe">
              <div className="recipe-description">
              { this.state.recipe.description }
              </div>
              </div>)
    }
    
               
  }
}
