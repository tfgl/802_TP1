import exp from 'express';
const router = exp.Router();

router.get('/', (req, res) => {
  res.send('hi');
  return ['ok'];
})

export default router;
