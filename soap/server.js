import exp from "express";
import soap from 'soap';
import path from 'path';
import {fileURLToPath} from 'url';

// creation de l'application
const app = exp();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(exp.static(path.join(__dirname, "./")));
app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const url = 'http://localhost:8000/wsdl?wsdl';

// parse automatique
app.use( exp.json() );

app.get("/soap",  (req, res) => {
  soap.createClient(url, function (err, client) {
    if (err){
      throw err;
    }
    /*
    * Parameters of the service call: they need to be called as specified
    * in the WSDL file
    */
    var args = {
      message: "all",
      splitter: 0
    };
    // call the service
    client.MessageSplitter(args, function (err, response) {
      if (err)
        throw err;
        // print the service returned result
        res.status(200).json({response});

    });
  });
})
app.listen(3001);
