import exp from 'express';
import router from './routes';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
})

// TODO
// - soap:
//    -1 liste de vehicules:
//       vehicules | autonomie | temps de recharge
//
// - Rest:
//    deployer:
//    -2 temps de parcour:
//        dst + temps de recharge
//
//    interroger:
//    -3 emplacement de borne de recharge proche des coordoone gps fournie
//      coo + borne
//
//    -4 cartographie pour afficher le trajet
//
//
//    1:
//    get /vehicules
//
//    2:
//    post /temps
//         dst en km
//         temps de rechargement en minutes
//
//    3:
//    post /borne
//        coo -> {lat, long}
//
//    4:
//    post /carte
//        depart {lat, long}
//        arriver ...
//
//
//
//        https://opendata.reseaux-energies.fr/explore/dataset/bornes-irve/api/?disjunctive.region
