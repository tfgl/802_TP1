import 'dotenv/config'
import exp from 'express';
import axios from 'axios';
import {log, extract} from '../utils/func.js';

const apiKey = process.env.API_KEY
const router = exp.Router();

const cars = {
  'tesla': {
    autonomie: '500',
    tempsDeRechargement: '10'
  },
  'zoe': {
    autonomie: '200',
    tempsDeRechargement: '5'
  }
}

const getBornes = async(req, res) => {
  const lat = req.param("lat")
  const long = req.param("long")
  const dst = req.param("dst")

  const baseUrl = "https://opendata.reseaux-energies.fr/api/records/1.0/search/?"
  const url = `${baseUrl}dataset=bornes-irve&sort=n_amenageur&facet=region&geofilter.distance=${lat}%2C${long}%2C${dst}`
  const template = ["n_station", "ylatitude", "xlongitude", "acces_recharge"]

  const apiRes = await axios.get(url)
  const bornes = apiRes.data.records.map(extract(template))

  console.table(bornes)
  res.status(200).json(bornes)

  return ['ok'];
}

const tempsDeParcours = async(req, res) => {
  const car = cars[req.param("car")]
  const autonomie = car.autonomie;//req.param("autonomie");
  const tempsDeRechargement = car.tempsDeRechargement; //req.param("tempsDeRechargement");
  const slat  = parseInt(req.param("slat"))
  const slong = parseInt(req.param("slong"))
  const dlat  = parseInt(req.param("dlat"))
  const dlong = parseInt(req.param("dlong"))

  const baseUrl = `https://api.openrouteservice.org/v2/matrix/driving-car`

  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
      'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
    }
  }

  const body = {
    "locations":[[slat,slong],[dlat,dlong]],
    "metrics":["duration","distance"],
    "units":"km"
  }

  try {
    const resp = await axios.post(baseUrl, body, options)
    const time = resp.data.durations[0].filter(element =>{ return element != 0})[0] / 60
    res.status(200).json([parseInt(time/60), parseInt(time % 60)])
    return ['ok', resp.data.durations[0]];
  } catch( err ) {
    return ['err', err];
  }
}

const getVehicles = async (req, res) => {
  res.status(200).json(cars)
  return ['ok']
}

router.get('/tempsDeParcours', log(tempsDeParcours))
router.get('/bornes', log(getBornes))
router.get('/getVehicles', log(getVehicles))

export default router;

/*
 curl -X POST \                                                                                                                                                                     g@garch
'https://api.openrouteservice.org/v2/matrix/driving-car' \
-H 'Content-Type: application/json; charset=utf-8' \
-H 'Accept: application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8' \
-H 'Authorization: 5b3ce3597851110001cf62483c0d805f134e411280747d8b01f422d1' \
-d '{"locations":[[9.70093,48.477473],[115.663757,38.106467]],"metrics":["duration"]}'

->
{"durations":[[0.0,395701.75],[397003.25,0.0]],"destinations":[{"location":[9.700817,48.476406],"snapped_distance":118.92},{"location":[115.665017,38.100717],"snapped_distance":648.79}],"sources":[{"location":[9.700817,48.476406],"snapped_distance":118.92},{"location":[115.665017,38.100717],"snapped_distance":648.79}],"metadata":{"attribution":"openrouteservice.org | OpenStreetMap contributors","service":"matrix","timestamp":1644170422614,"query":{"locations":[[9.70093,48.477473],[115.663757,38.106467]],"profile":"driving-car","responseType":"json","metricsStrings":["DURATION"],"metrics":["duration"]},"engine":{"version":"6.7.0","build_date":"2022-01-10T10:41:35Z","graph_date":"2022-01-17T04:44:01Z"}}}
*/
