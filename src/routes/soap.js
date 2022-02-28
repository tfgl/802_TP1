import soap from 'soap'
import exp from 'express';
import {log, extract} from '../utils/func.js';
const router = exp.Router();

const getVehicles = (req, res) => {
}

router.get('/getVehicles', log(getVehicles))

export default router;
