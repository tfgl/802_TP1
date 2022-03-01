import 'dotenv/config'
import exp from 'express';
import axios from 'axios';
import {log, extract} from '../utils/func.js';
import cars from '../data/cars.json';

const router = exp.Router();

const getBornes = async(lng, lat, rayon) => {
  const baseUrl = "https://opendata.reseaux-energies.fr/api/records/1.0/search/?"
  const url = `${baseUrl}dataset=bornes-irve&q=&facet=region&geofilter.distance=${lat}%2C${lng}%2C${rayon}`
  const template = ["n_station", "ylatitude", "xlongitude", "acces_recharge"]

  const apiRes = await axios.get(url)
  const bornes = apiRes.data.records.map(extract(template))

  return bornes;
}

const itineraire = async (req, res) => {
  const steps = req.body.steps;
  const car = cars.find( car => car.name == req.body.car );

  let autonomie = car.autonomy;
  let dst = 0;
  let stations = [];
  for(let i=0; i<steps.length; i++) {
    const step = steps[i];
    const stepDst = step.distance;
    const pos = step.intersections[0].location;
    const nextDst = dst + stepDst;

    if( autonomie < nextDst ) {
      let station = (await getBornes(pos[0], pos[1], autonomie*1000))[0];
      stations.push(station);
      console.log(station);
      autonomie = car.autonomy;
      dst = 0;
    }
    else {
      autonomie -= stepDst;
      dst += stepDst;
    }
  }

  res.status(200).json({stations})
  return ["ok", stations]
}

router.post('/itineraire', log(itineraire));

export default router;
