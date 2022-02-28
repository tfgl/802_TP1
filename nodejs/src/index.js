import exp from 'express';
import router from './routes';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const port = process.env.PORT || 3000
const app  = exp()

app.set('view engine', 'ejs');

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.render('index');
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
