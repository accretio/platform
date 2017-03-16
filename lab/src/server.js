'use strict';


import path from 'path';
import { Server } from 'http';
import Express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from './routes';
import NotFoundPage from './components/NotFoundPage';
import { Button } from 'reactstrap';

import formidable from 'formidable';
import fs from 'fs';

import AWS from 'aws-sdk';

// initialize the server and configure support for ejs templates
const app = new Express();
const server = new Server(app);

// initialize the AWS credentials
var credentials = new AWS.SharedIniFileCredentials({profile: 'accretio'});
AWS.config.credentials = credentials;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// define the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, 'static')));

console.log("loading twice");

// api methods

app.use('/api/s3', require('react-s3-uploader/s3router')({
  bucket: "accretio-lab-files",
  region: 'us-west-1',
  signatureVersion: 'v4', 
  headers: {'Access-Control-Allow-Origin': '*'}, // optional
  uploadRequestHeaders: {},
    ACL: 'private', // this is default
   uniquePrefix: false // (4.0.2 and above) default is true, setting the attribute to false preserves the original filename in S3
}));

app.get('/api/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});


// universal routing and rendering

app.get('*', (req, res) => {
  match(
    { routes, location: req.url },
    (err, redirectLocation, renderProps) => {
      console.error(err);
      // in case of error display the error message
      if (err) {
        return res.status(500).send(err.message);
      }

      // in case of redirect propagate the redirect to the browser
      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      }

      // generate the React markup for the current route
      let markup;
      if (renderProps) {
        // if the current route matched we have renderProps
        markup = renderToString(<RouterContext {...renderProps}/>);
      } else { 
        // otherwise we can render a 404 page
        markup = renderToString(<NotfoundPage />);
        res.status(404);
      }

      // render the index template with the embedded React markup
      return res.render('index', { markup });
    }
  );
});

// start the server
const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'production';
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on http://localhost:${port} [${env}]`);
});
