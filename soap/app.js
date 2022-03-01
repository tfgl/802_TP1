/*jslint node: true */
"use strict";

import soap from 'soap';
import express from 'express';
import fs from 'fs';
import voitures from '../data/cars.json';

// the splitter function, used by the service
function splitter_function(args) {
  console.log('splitter_function');
  var splitter = args.splitter;
  var message = args.message;
  var result = [];
  if (message==="all") {
    for(var i=0; i<voitures.length; i++){
      result.push(voitures[i]);
    }
  }else {
    result.push(voitures[splitter]);
  }

  return {
    result: result
  }
}

// the service
const serviceObject = {
  MessageSplitterService: {
    MessageSplitterServiceSoapPort: {
      MessageSplitter: splitter_function
    },
    MessageSplitterServiceSoap12Port: {
      MessageSplitter: splitter_function
    }
  }
};

// load the WSDL file
var xml = fs.readFileSync('service.wsdl', 'utf8');
// create express app
var app = express();
app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Launch the server and listen
const port = 8000;
app.listen(port, function () {
  console.log('Listening on port ' + port);
  const wsdl_path = "/wsdl";
  soap.listen(app, wsdl_path, serviceObject, xml);
  console.log("Check http://localhost:" + port + wsdl_path +"?wsdl to see if the service is working");
});
