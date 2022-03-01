import 'dotenv/config'
import exp from 'express';
import axios from 'axios';
import geolib from 'geolib';
import mbxClient from '@mapbox/mapbox-sdk';
import mbxMatrix from '@mapbox/mapbox-sdk/services/matrix';
import {log, extract} from '../utils/func.js';
import cars from '../cars.json';

const apiKey = process.env.API_KEY
const router = exp.Router();

const baseClient = mbxClient({ accessToken: 'pk.eyJ1IjoiYW9ldSIsImEiOiJjbDA2czl2b3AwMGxzM2xxcHBtcm5vMm94In0.ImFR4kwS9cJ8tnz5jKBd4Q' });
const matrixClient = mbxMatrix(baseClient)

const getBornes = async(lng, lat, rayon) => {
  const baseUrl = "https://opendata.reseaux-energies.fr/api/records/1.0/search/?"
  const url = `${baseUrl}dataset=bornes-irve&q=&facet=region&geofilter.distance=${lat}%2C${lng}%2C${rayon}`
  const template = ["n_station", "ylatitude", "xlongitude", "acces_recharge"]

  const apiRes = await axios.get(url)
  const bornes = apiRes.data.records.map(extract(template))

  console.log(`${lng} ${lat} ${rayon} ${url}`)
  console.table(bornes)

  return bornes;
}

const tempsDeParcours = async(req, res) => {
  const car = req.body.car;
  const src = req.body.src;
  const dst = req.body.dst;
  const slat  = parseInt(src.lat);
  const slong = parseInt(src.long);
  const dlat  = parseInt(dst.lat);
  const dlong = parseInt(dst.long);

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
    console.log(body)
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

const trajet = async (req, res) => {
  const car = cars[req.body.car];
  const stops = req.body.stops;
  let dstTotal = 0;
  let travelTime = 0;

  for(let i=0; i<stops.length-1; i++) {
    dstTotal += geolib.getDistance(stops[i], stops[i+1]);
  }
  dstTotal /= 1000;
  getBornes(stops[0].lng, stops[0].lat, 10000);

  let points = []
  stops.forEach( p => {points.push({coordinates: [p.lng, p.lat]})})

  let response = await matrixClient.getMatrix({
    points: points,
    profile: 'driving'
  }).send()
  const matrix = response.body;
  console.log(matrix)

  travelTime = matrix.durations[0].reduce( (acc, t) => { return acc + t }, 0) / 3600
  console.log(travelTime)
  console.log(dstTotal)

  res.status(200).json({dstTotal, travelTime});
  return ["ok"]
}

router.post('/trajet', log(trajet));
//router.post('/tempsDeParcours', log(tempsDeParcours))
//router.get('/bornes', log(getBornes))
//router.get('/getVehicles', log(getVehicles))

export default router;
