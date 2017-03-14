/** @jsx React.DOM */

var React = require('react'),
    Bootstrap = require('bootstrap'),
    Recipe = require('./components/Recipe.react');
// var TweetsApp = require('./components/TweetsApp.react');

// Snag the initial state that was passed from the server side
var initialState = JSON.parse(document.getElementById('initial-state').innerHTML)



// Render the components, picking up where react left off on the server
React.renderComponent(
  <Recipe />,
  document.getElementById('react-app')
);

