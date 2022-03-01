import exp from 'express';
import bodyParser from 'body-parser';
import soap from 'soap'
import router from './routes';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import getAll_Service from './soap';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const xml = fs.readFileSync('wsdl/vehicles.wsdl', 'utf8');
const port = process.env.PORT || 3000
const app  = exp()

app.set('view engine', 'ejs');
app.use(exp.static(path.join(__dirname, "html")));

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(
  bodyParser.json({ limit: "50mb" }),
  exp.urlencoded({
    extended: true
  })
)

app.use(exp.json())

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});

app.use('/rest', router.station)

app.listen(port, () => {
  console.log(`server running on port ${port}`)
  soap.listen(app, '/wsdl', getAll_Service, xml);
})
