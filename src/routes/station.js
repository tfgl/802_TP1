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

  return bornes;
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
  travelTime += Math.floor(dstTotal / car.autonomie) / 3600
  console.log(travelTime)
  console.log(dstTotal)

  res.status(200).json({dstTotal, travelTime});
  return ["ok"]
}

const itineraire = async (req, res) => {
  const steps = req.body.steps;
  const car = cars[req.body.car];
  console.log(steps[0]);

  let autonomie = car.autonomie;
  let dst = 0;
  let pos = {lng: 0, lat: 0};
  let dstTotal = 0;
  const stations = steps.reduce( (acc, step) => {
    const stepDst = step.distance;
    const pos = step.intersections[0].location;
    const nextDst = dst + stepDst;

    steps.forEach( s => {travelTime += s.duration})

    if( autonomie < nextDst ) {
      const station = getBornes(pos[0], pos[1], autonomie)[0];
      acc.push(station);
      autonomie = car.autonomie;
      dst = 0;
      travelTime = car.reloadTime;
    }
    else {
      autonomie -= stepDst;
      dst += stepDst;
      dstTotal += stepDst;
    }
  }, []);

  res.status(200).json({dstTotal, travelTime, stations})
  return ["ok", stations]
}

router.post('/trajet', log(trajet));
router.post('/itineraire', log(itineraire));

export default router;
