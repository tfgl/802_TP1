import soap from 'soap'
import express from 'express';
import bodyParser from 'body-parser';
//import http from 'http';
import fs from 'fs'
let xml = fs.readFileSync('wsdl/vehicles.wsdl', 'utf8');

let vehicleService = {
  VehicleService: {
    Port: {
      Hello: function(args, cb, headers, req) {
        console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
        return {
          name: "Hi"
        };
      }
    }
  }
};

//
////http server example
//let server = http.createServer((request,response) => {
//  response.end('404: Not Found: ' + request.url);
//});
//
//server.listen(8000);
//soap.listen(server, '/wsdl', vehicleService, xml, () => {
//  console.log('server initialized');
//});

//express server example
let app = express();
//body parser middleware are supported (optional)
app.use(bodyParser.raw({type: function(){return true;}, limit: '5mb'}));
app.listen(8001, function(){
  //Note: /wsdl route will be handled by soap module
  //and all other routes & middleware will continue to work
  soap.listen(app, '/wsdl', vehicleService, xml, ()=>{
    console.log('server initialized');
  });
});
