import soap from 'soap'
import express from 'express';
import fs from 'fs'
//import bodyParser from 'body-parser';

const xml = fs.readFileSync('wsdl/vehicles.wsdl', 'utf8');
const app = express();

const myService = {
  MyService: {
    MyPort: {
      GetAll: function(args) {
        console.log("GetAll");
        return {cars: [
          {name: "Tesla model 3", autonomie: 490, reload: 24},
          {name: "volkswagen", autonomie: 350, reload: 40},
          {name: "renault megan", autonomie: 300, reload: 20},
          {name: "Hyundai Ioniq", autonomie: 230, reload: 35},
          {name: "nissan leaf", autonomie: 270, reload: 25}
        ]};
      },
    }
  }
};


//app.use(bodyParser.raw({
//  type: () => {return true;},
//  limit: '5mb'
//}));

app.listen(8000, () => {
  soap.listen(app, '/wsdl', myService, xml);
});
